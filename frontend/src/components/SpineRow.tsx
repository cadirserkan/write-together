// A row of book spines standing on a shelf, as decoration under the login and register forms.
// Every spine is [width, height, colour]; one book leans against its neighbour.
const SPINES: [number, number, string][] = [
  [22, 96, '#3b62a8'],
  [30, 118, '#8a3d63'],
  [18, 84, '#d39b22'],
  [26, 108, '#4c8c5a'],
  [34, 92, '#56616c'],
  [20, 122, '#b9502f'],
  [28, 100, '#6a56b0'],
  [18, 112, '#d39b22'],
  [32, 88, '#3b62a8'],
  [24, 116, '#4c8c5a'],
  [20, 94, '#8a3d63'],
  [30, 106, '#b9502f'],
  [22, 120, '#56616c'],
  [26, 90, '#6a56b0'],
];

const LEANING = 9;

export function SpineRow() {
  return (
    <div className="spines" aria-hidden="true">
      {SPINES.map(([width, height, color], index) => (
        <span
          key={index}
          className={index === LEANING ? 'spine spine-leaning' : 'spine'}
          style={{ width, height, backgroundColor: color }}
        />
      ))}
    </div>
  );
}
