interface DotPatternProps {
  id: string;
  fill: string;
  size: number;
}

// export const patternSelectedGleis = `
// <pattern
//   id="patternSelectedGleis"
//   patternUnits="userSpaceOnUse"
//   width="10"
//   height="10">
//     <image
//       xlink:href="data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxMCcgaGVpZ2h0PScxMCc+CiAgPHJlY3Qgd2lkdGg9JzEwJyBoZWlnaHQ9JzEwJyBmaWxsPSd3aGl0ZScvPgogIDxwYXRoIGQ9J00tMSwxIGwyLC0yCiAgICAgICAgICAgTTAsMTAgbDEwLC0xMAogICAgICAgICAgIE05LDExIGwyLC0yJyBzdHJva2U9J2JsYWNrJyBzdHJva2Utd2lkdGg9JzEnLz4KPC9zdmc+Cg=="
//       x="0"
//       y="0"
//       width="10"
//       height="10"
//     />
// </pattern>`;

const pattern1 = (id: string, fill: string) => `
<pattern
  id="${id}"
  height="10"
  width="10"
  patternUnits="userSpaceOnUse"
  y="0"
  x="0"
  overflow="visible">
    <path style="stroke:${fill}" d="m0 10l10-10" />
</pattern>`;

const pattern2 = (id: string, fill: string) => `
<pattern
  id="${id}"
  height="10"
  width="10"
  patternUnits="userSpaceOnUse"
  y="0"
  x="0"
  overflow="visible"
>
  <path
    style="stroke:${fill};fill:${fill}"
    d="m10 1-9 9h-1v-1l9-9h1zm-10-1v1l1-1zm9 10h1v-1z"
  />
</pattern>`;

const pattern3 = (id: string, fill: string, fillBg: string = '#fff') => `
<pattern
  id="${id}"
  height="10"
  width="10"
  patternUnits="userSpaceOnUse"
  y="0"
  x="0"
  overflow="visible"
>
  <rect
    height="10"
    width="10"
    y="0"
    x="0"
    style="fill:${fillBg}"
  />
  <path style="stroke:${fill}" d="m0 0l10 10" />
</pattern>`;

const pattern4 = (id: string, fill: string, fillBg: string = '#fff') => `
<pattern
  id="${id}"
  height="10"
  width="10"
  patternUnits="userSpaceOnUse"
  y="0"
  x="0"
  overflow="visible"
>
  <rect
    height="10"
    width="10"
    y="0"
    x="0"
    style="fill:${fillBg}"
  />
  <path
    style="stroke:${fill};fill:${fill}"
    d="m0 1 9 9h1v-1l-9-9h-1zm0 8v1h1zm9-9h1v1z"
  />
</pattern>`;

const pattern5 = (id: string, fill: string) => `
<pattern
  id="${id}"
  height="10"
  width="10"
  patternUnits="userSpaceOnUse"
  y="0"
  x="0"
  overflow="visible"
>
  <path style="stroke-linejoin:bevel;stroke:${fill}" d="m5 0v10" />
</pattern>`;

const pattern6 = (id: string, fill: string) => `
<pattern
  id="${id}"
  height="10"
  width="10"
  patternUnits="userSpaceOnUse"
  y="0"
  x="0"
  overflow="visible"
>
  <path style="stroke:${fill};fill:${fill}" d="m4 0h2v10h-2v-10z" />
</pattern>`;

const pattern7 = (id: string, fill: string) => `
<pattern
  id="${id}"
  height="10"
  width="10"
  patternUnits="userSpaceOnUse"
  y="0"
  x="0"
  overflow="visible"
>
  <path style="stroke-linejoin:bevel;stroke:${fill}" d="m0 5h10" />
</pattern>`;

const pattern8 = (id: string, fill: string) => `
<pattern
  id="${id}"
  height="10"
  width="10"
  patternUnits="userSpaceOnUse"
  y="0"
  x="0"
  overflow="visible"
>
  <path style="stroke:${fill};fill:${fill}" d="m0 4h10v2h-10z" />
</pattern>`;

const pattern9 = (id: string, fill: string) => `
<pattern
  id="${id}"
  height="10"
  width="10"
  patternUnits="userSpaceOnUse"
  y="0"
  x="0"
  overflow="visible"
>
  <path style="stroke:${fill}" d="m5 0v10m-5-5h10" />
</pattern>`;

const pattern10 = (id: string, fill: string) => `
<pattern
  id="${id}"
  height="10"
  width="10"
  patternUnits="userSpaceOnUse"
  y="0"
  x="0"
  overflow="visible"
>
  <path style="stroke:${fill}" d="m0 0l10 10m0-10l-10 10" />
</pattern>`;

const pattern11 = (id: string, fill: string) => `
<pattern
  id="${id}"
  height="10"
  width="10"
  patternUnits="userSpaceOnUse"
  y="0"
  x="0"
  overflow="visible"
>
  <circle cy="5" cx="5" r="1" style="stroke:${fill};fill:${fill}" />
</pattern>`;

const pattern12 = (id: string, fill: string) => `
<pattern
  id="${id}"
  height="10"
  width="10"
  patternUnits="userSpaceOnUse"
  y="0"
  x="0"
  overflow="visible"
>
  <circle cy="5" cx="5" r="2" style="stroke:${fill};fill:${fill}" />
</pattern>`;

const pattern13 = (id: string, fill: string) => `
<pattern
  id="${id}"
  height="20"
  width="20"
  patternUnits="userSpaceOnUse"
  y="0"
  x="0"
  overflow="visible"
>
  <circle cy="3" cx="5" r="2" style="fill:${fill}" />
  <circle cy="13" cx="5" r="2" style="fill:${fill}" />
  <circle cy="8" cx="15" r="2" style="fill:${fill}" />
  <circle cy="18" cx="15" r="2" style="fill:${fill}" />
</pattern>`;

const pattern14 = (id: string, fill: string) => `
<pattern
  id="${id}"
  height="12"
  width="12"
  patternUnits="userSpaceOnUse"
  y="0"
  x="0"
  overflow="visible"
>
  <rect
    y="0"
    x="0"
    style="stroke:${fill};fill:none"
    height="12"
    width="12"
  />
  <circle cy="6" cx="6" r="1" style="stroke:${fill};fill:${fill}" />
</pattern>`;

const pattern15 = (id: string, fill: string) => `
<pattern
  id="${id}"
  height="12"
  width="12"
  patternUnits="userSpaceOnUse"
  y="0"
  x="0"
  overflow="visible"
>
  <rect
    y="0"
    x="0"
    style="stroke:${fill};fill:none"
    height="12"
    width="12"
  />
  <circle cy="6" cx="6" r="2" style="stroke:${fill};fill:${fill}" />
</pattern>`;

const pattern16 = (id: string, fill: string) => `
<pattern
  id="${id}"
  height="12"
  width="12"
  patternUnits="userSpaceOnUse"
  y="0"
  x="0"
  overflow="visible"
>
  <path
    style="stroke-linejoin:bevel;stroke:${fill};fill:DarkGrey"
    d="m0 9l3 3 9-9-3-3z"
  />
  <path
    style="fill:DarkGrey"
    d="m0 0v3l3 3 3-3-3-3h-3zm6 9l3 3h3v-3l-3-3zm-6 3h3l-3-3zm12-12v3l-3-3z"
  />
</pattern>`;

const pattern17 = (id: string, fill: string) => `
<pattern
  id="${id}"
  height="10"
  width="10"
  patternUnits="userSpaceOnUse"
  y="0"
  x="0"
  overflow="visible"
>
  <path style="stroke:${fill};fill:${fill}" d="m0 0h10l-10 10z" />
</pattern>`;

const pattern18 = (id: string, fill: string) => `
<pattern
  id="${id}"
  height="10"
  width="10"
  patternUnits="userSpaceOnUse"
  y="0"
  x="0"
  overflow="visible"
>
  <rect
    y="0"
    x="0"
    style="stroke:${fill};fill:${fill}"
    height="5"
    width="5"
  />
  <rect
    y="5"
    x="5"
    style="stroke:${fill};fill:${fill}"
    height="5"
    width="5"
  />
</pattern>`;

const pattern19 = (id: string, fill: string) => `
<pattern
  id="${id}"
  height="10"
  width="10"
  patternUnits="userSpaceOnUse"
  y="0"
  x="0"
  overflow="visible"
>
  <path style="stroke:${fill};fill:${fill}" d="m0 5l5 5 5-5-5-5z" />
</pattern>`;

const pattern20 = (id: string, fill: string) => `
<pattern
  id="${id}"
  height="10"
  width="10"
  patternUnits="userSpaceOnUse"
  y="0"
  x="0"
  overflow="visible"
>
  <circle cy="5" cx="5" r="4" style="stroke:${fill};fill:${fill}" />
</pattern>`;

// export const patternSelectedGleis = pattern18('pattern18', 'rgba(204, 255, 197,.8)');
// export const patternSelectedGleis = pattern3('pattern3', 'rgba(0, 0, 0, .3)');
export const patternSelectedGleis = pattern3('pattern3', 'rgba(0, 0, 0, .3)');

export const patterns: {
  [id: string]: (id: string, fill: string) => string;
} = {
  pattern1,
  pattern2,
  pattern3,
  pattern4,
  pattern5,
  pattern6,
  pattern7,
  pattern8,
  pattern9,
  pattern10,
  pattern11,
  pattern12,
  pattern13,
  pattern14,
  pattern15,
  pattern16,
  pattern17,
  pattern18,
  pattern19,
  pattern20,
};
