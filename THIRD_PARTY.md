# Сторонние компоненты

Авторский код редактора и сторонние библиотеки имеют отдельные права. Надпись в подвале не заменяет лицензии зависимостей.

- **KaTeX 0.16.22**, MIT License, https://github.com/KaTeX/KaTeX — офлайн-вёрстка формул. Лицензия: `vendor/KaTeX-LICENSE.txt`.
- **Nunito**, SIL Open Font License 1.1, https://github.com/google/fonts/tree/main/ofl/nunito — `vendor/nunito-OFL.txt`.
- **Roboto**, SIL Open Font License 1.1, https://github.com/google/fonts/tree/main/ofl/roboto — `vendor/roboto-OFL.txt`.
- **Open Sans**, SIL Open Font License 1.1, https://github.com/google/fonts/tree/main/ofl/opensans — `vendor/opensans-OFL.txt`.
- **LinkeDOM 0.18.12**, ISC License, https://github.com/WebReflection/linkedom — только тестовая зависимость, в редактор и игру не включается.

Библиотека и файлы шрифтов зафиксированы в `vendor-assets.zip`, для сборки извлекаются в `vendor/`. В готовый HTML встраиваются KaTeX и его шрифты, а также выбранное семейство игрового шрифта; внешний CDN при запуске не используется.

Пользовательская шпаргалка «Шпаргалка по LaTeX» Светланы Быковой прочитана как справочный материал для математического синтаксиса. PDF не включён в публичный репозиторий или распространяемый архив.

- **gifuct-js 2.1.2**, MIT, https://github.com/matt-way/gifuct-js — чтение GIF; `vendor/gifuct-js-LICENSE.txt`.
- **js-binary-schema-parser 2.0.3**, MIT, https://github.com/matt-way/jsBinarySchemaParser — зависимость GIF-декодера; `vendor/js-binary-schema-parser-LICENSE.txt`.
- **gifenc 1.0.3**, MIT, https://github.com/mattdesl/gifenc — кодирование GIF; `vendor/gifenc-LICENSE.txt`.

GIF-кодеки встроены в редактор и не требуют сети. Дизайны бочонков созданы средствами SVG внутри проекта.

- **fake-indexeddb 6.2.2**, Apache-2.0, https://github.com/dumbmatter/fakeIndexedDB — только тестирование хранилища; в редактор и экспорт не включается.

## Noto Animated Emoji

© Google. Анимации лицензированы по [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Источник: [официальная библиотека](https://googlefonts.github.io/noto-emoji-animation/), [каталог](https://googlefonts.github.io/noto-emoji-animation/data/api.json), снимок 18 сентября 2026 (881 запись). `src/gif-library.js` содержит только метаданные каталога. Анимации загружаются с официального fonts.gstatic.com после выбора пользователем; размер GIF уменьшается при добавлении. Проект сохраняет `notoAttribution`, а игра показывает автора, ссылку на источник, лицензию и отметку изменения размера. Шесть анимаций предыдущей версии удалены из каталога.

## PDF.js

Импорт PDF использует Mozilla PDF.js / pdfjs-dist **6.3.289**, совместимую сборку `legacy/build`. Лицензия Apache-2.0: https://github.com/mozilla/pdf.js/blob/master/LICENSE . Официальная документация: https://mozilla.github.io/pdf.js/examples/ . Модуль, worker, таблицы символов и ресурсы шрифтов загружаются по требованию с jsDelivr с закреплённой версией. В дистрибутив они не копируются; экспорт содержит только преобразованные страницы пользовательского материала.
