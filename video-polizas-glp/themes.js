// Temas de fondo. Se elige con el hash de la URL: index.html#claro | #grafito | #marca | (vacío = noche)
const THEMES = {
  noche: { grass: ['#0B3B3A', '#0F5B4F', '#12695B'], bg: ['#06132F', '#0A1F4F', '#0047BB'], arcs: 'rgba(255,184,28,A)', dots: 'rgba(220,232,255,A)',
    sky: [[0, '#040C22'], [.35, '#0A1F4F'], [.62, '#0047BB'], [.84, '#3D7BE0'], [.95, '#FFB27A'], [1, '#FF8A1C']], skyTop: '#040C22',
    mt: ['#173A86', '#0B2460', '#0E2C6E', '#081A47'], city: '#0B2257', cityTop: '#1B3F8C', win: .35, stars: 1, lamp: 1, ground: ['#14295C', '#0C1E49', '#050F2A'] },
  grafito: { grass: ['#13241F', '#1B3A31', '#21463B'], bg: ['#0B0F17', '#131A26', '#1E2939'], arcs: 'rgba(255,184,28,A)', dots: 'rgba(230,234,242,A)',
    sky: [[0, '#07090F'], [.4, '#121A2A'], [.68, '#24324C'], [.86, '#3C4E6E'], [.95, '#FFB27A'], [1, '#FF8A1C']], skyTop: '#07090F',
    mt: ['#2A3650', '#1A2336', '#202B40', '#131A28'], city: '#161E2D', cityTop: '#2A3650', win: .35, stars: 1, lamp: 1, ground: ['#1E2636', '#151B27', '#0B0F17'] },
  marca: { grass: ['#145C4A', '#1B7A60', '#22906F'], bg: ['#0047BB', '#0A5BD6', '#2F7BEA'], arcs: 'rgba(255,184,28,A)', dots: 'rgba(255,255,255,A)',
    sky: [[0, '#0A3E9E'], [.4, '#0A5BD6'], [.7, '#3D8BF0'], [.88, '#8EC2FF'], [.96, '#FFD08A'], [1, '#FFA040']], skyTop: '#0A3E9E',
    mt: ['#2A6FD6', '#1A57B8', '#1D60C4', '#13479E'], city: '#164FB0', cityTop: '#2E6FD3', win: .25, stars: .4, lamp: .5, ground: ['#123E91', '#0D3277', '#082459'] },
  claro: { grass: ['#6DB98A', '#4E9C6C', '#7CCB98'], bg: ['#FFFFFF', '#F2F5FA', '#E1E9F5'], arcs: 'rgba(255,122,0,A)', dots: 'rgba(0,71,187,A)',
    sky: [[0, '#4C8DEB'], [.4, '#7DB4FA'], [.7, '#B9D7FF'], [.88, '#E6F1FF'], [.96, '#FFE3BD'], [1, '#FFC98A']], skyTop: '#4C8DEB',
    mt: ['#8FB2E3', '#7099D2', '#A5C2EA', '#86A8DA'], city: '#9DB6DC', cityTop: '#B9CCE8', win: 0, stars: 0, lamp: 0, ground: ['#4A5A78', '#3A4864', '#2B364D'] },
};
const THEME_NAME = (location.hash || '#claro').slice(1);
const THEME = THEMES[THEME_NAME] || THEMES.noche;
document.documentElement.dataset.theme = THEME_NAME;
