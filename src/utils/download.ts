export function download() {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const a = document.createElement('a');
  a.href = canvas.toDataURL('image/png');
  a.download = 'fractal.png';
  const clickHandler = () => {
    setTimeout(() => {
      a.removeEventListener('click', clickHandler);
    }, 150);
  };
  a.addEventListener('click', clickHandler, false);
  a.click();
}
