export const pad = (value: unknown, length = 2) => {
  const s = value?.toString() ?? '';
  return s.padStart(length, '0');
};

export const padCenter = (value: unknown, length = 2) => {
  const s = value?.toString() ?? '';
  const diff = length - s.length;
  return s.padStart(Math.floor(diff / 2) + s.length, ' ').padEnd(length, ' ');
};

export const formatDate = (date: Date) => {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)} ${pad(day)}/${pad(month)}/${pad(year)}`;
};

export const cropTextToBox = (text: string, width: number, height: number) => {
  const output = text
    .split('\n')
    .map(l => l.slice(0, width))
    .slice(0, height);
  const diff = height - output.length;
  return output.join('\n') + '\n'.repeat(diff);
};


export const fitTextToBox = (text: string, width: number, height: number) => {
  const pattern = new RegExp(`(.{1,${width}})( +|$)\n?|(.{${width}})`, 'g');
  return text
    .split('\n')
    .map(s => s.replace(pattern, '$1$3\n'))
    .slice(0, height)
    .join('\n')
};