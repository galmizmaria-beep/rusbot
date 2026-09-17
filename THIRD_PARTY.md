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

Встроенные GIF в `src/gif-library.js` — оригинальные геометрические анимации, созданные программно для этого редактора; сторонние изображения не использовались.
