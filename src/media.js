const LotoMedia = (() => {
  const imagePattern=/^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/;
  const audioPattern=/^data:audio\/(mpeg|wav|ogg|mp4|webm);base64,[A-Za-z0-9+/=]+$/;
  const validImage=s=>!s||typeof s==='string'&&imagePattern.test(s)&&s.length<=14*1024*1024;
  const validAudio=s=>!s||typeof s==='string'&&audioPattern.test(s)&&s.length<=21*1024*1024;
  const readBlob=blob=>new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(Error('Не удалось прочитать файл.'));reader.readAsDataURL(blob);});
  function signature(bytes,fileType=''){const ascii=(a,b)=>String.fromCharCode(...bytes.slice(a,b));if(bytes[0]===137&&ascii(1,4)==='PNG')return 'image/png';if(bytes[0]===255&&bytes[1]===216&&bytes[2]===255)return 'image/jpeg';if(ascii(0,3)==='GIF')return 'image/gif';if(ascii(0,4)==='RIFF'&&ascii(8,12)==='WEBP')return 'image/webp';if(ascii(0,4)==='RIFF'&&ascii(8,12)==='WAVE')return 'audio/wav';if(ascii(0,3)==='ID3'||bytes[0]===255&&(bytes[1]&224)===224)return 'audio/mpeg';if(ascii(0,4)==='OggS')return 'audio/ogg';if(ascii(4,8)==='ftyp')return 'audio/mp4';if(bytes[0]===26&&bytes[1]===69&&bytes[2]===223&&bytes[3]===163&&fileType.startsWith('audio/'))return 'audio/webm';throw Error('Неподдерживаемый формат. Изображения: PNG, JPEG, WebP, GIF. Аудио: MP3, WAV, OGG, M4A, WebM.');}
  function image(src){return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(Error('Изображение повреждено.'));img.src=src;});}
  async function compressGif(bytes,max=640,onProgress=()=>{}){
    const gif=GifDecoder.parseGIF(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength)),frames=gif.frames.filter(f=>f.image),w=gif.lsd.width,h=gif.lsd.height;
    if(!w||!h||!frames.length)throw Error('GIF не содержит кадров.');
    if(w*h>16000000||frames.length>350||w*h*frames.length>160000000)throw Error('GIF слишком большой для обработки. Используйте до 350 кадров и более компактное разрешение.');
    const ratio=Math.min(1,max/Math.max(w,h)),ow=Math.max(1,Math.round(w*ratio)),oh=Math.max(1,Math.round(h*ratio));
    const composed=new Uint8ClampedArray(w*h*4);
    const encoder=GifEncoder.GIFEncoder();let previous=null,snapshot=null,repeat=-1;const marker='NETSCAPE2.0';for(let i=0;i<bytes.length-17;i++){if(String.fromCharCode(...bytes.subarray(i,i+11))===marker&&bytes[i+11]===3){repeat=bytes[i+13]|bytes[i+14]<<8;break;}}
    for(let i=0;i<frames.length;i++){
      if(previous?.disposalType===2){const d=previous.dims;for(let y=d.top;y<Math.min(h,d.top+d.height);y++)composed.fill(0,(y*w+d.left)*4,(y*w+Math.min(w,d.left+d.width))*4);}
      if(previous?.disposalType===3&&snapshot)composed.set(snapshot);
      const frame=GifDecoder.decompressFrame(frames[i],gif.gct,true);snapshot=frame.disposalType===3?composed.slice():null;
      for(let y=0;y<frame.dims.height;y++)for(let x=0;x<frame.dims.width;x++){const px=x+frame.dims.left,py=y+frame.dims.top,src=(y*frame.dims.width+x)*4;if(px>=w||py>=h||!frame.patch[src+3])continue;composed.set(frame.patch.subarray(src,src+4),(py*w+px)*4);}
      const rgba=new Uint8ClampedArray(ow*oh*4);for(let y=0;y<oh;y++)for(let x=0;x<ow;x++){const src=(Math.min(h-1,Math.floor(y*h/oh))*w+Math.min(w-1,Math.floor(x*w/ow)))*4;rgba.set(composed.subarray(src,src+4),(y*ow+x)*4);}
      const palette=GifEncoder.quantize(rgba,128,{format:'rgba4444',oneBitAlpha:true}),ti=palette.findIndex(c=>c[3]===0);if(ti>0)[palette[0],palette[ti]]=[palette[ti],palette[0]];
      const index=GifEncoder.applyPalette(rgba,palette,'rgba4444');encoder.writeFrame(index,ow,oh,{palette,delay:frame.delay||100,repeat,transparent:ti>=0,transparentIndex:0,dispose:ti>=0?2:1});previous=frame;onProgress(i+1,frames.length);await new Promise(r=>setTimeout(r,0));
    }
    encoder.finish();return new Blob([encoder.bytes()],{type:'image/gif'});
  }
  async function prepare(file,{max=1280,onProgress=()=>{}}={}){const bytes=new Uint8Array(await file.arrayBuffer()),mime=signature(bytes,file.type);if(bytes.length>(mime.startsWith('audio/')?15:10)*1024*1024)throw Error(mime.startsWith('audio/')?'Аудиозапись должна быть не больше 15 МБ.':'Изображение должно быть не больше 10 МБ.');const original=new Blob([bytes],{type:mime});let result=original;
    if(mime==='image/gif')result=await compressGif(bytes,Math.min(max,640),onProgress);
    else if(mime.startsWith('image/')){const img=await image(await readBlob(original));if(img.width*img.height>40000000)throw Error('Максимум 40 мегапикселей.');const ratio=Math.min(1,max/Math.max(img.width,img.height)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(img.width*ratio));canvas.height=Math.max(1,Math.round(img.height*ratio));canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);result=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',.8))||original;}
    if(result.size>=original.size)result=original;return {data:await readBlob(result),before:original.size,after:result.size,mime:result.type};
  }
  function html(media,{compact=false}={}){if(!media)return '';return (media.image?`<img class="task-image ${compact?'compact':''}" src="${Loto.esc(media.image)}" alt="Иллюстрация" loading="eager">`:'')+(media.audio?`<audio class="task-audio" controls preload="metadata" src="${Loto.esc(media.audio)}" aria-label="Аудиозапись"></audio>`:'');}
  return {validImage,validAudio,signature,prepare,compressGif,html};
})();
