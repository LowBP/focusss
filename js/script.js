const canvas = document.querySelector( 'canvas' );
const context = canvas.getContext( '2d' );

let width, height, dpr;
let currentFocus;

const SPACING = 16;
const RADIUS = 8;
const CHECK_RADIUS = RADIUS * 1.8;
const CHECK_SIZE = 10;
const TAIL_LENGTH = 10;

const head = { r: RADIUS, tr: RADIUS };
const tail = [];
const checkMarks = new Map();

document.body.addEventListener( 'focus', event => focus( event.target ), true );
document.body.addEventListener( 'input', event => validate( event.target ), true );

document.querySelectorAll( 'input:not([type="checkbox"])' ).forEach( input => checkMarks.set( input, { v: 0, tv: 0 } ) );

function resize() {

  dpr = window.devicePixelRatio || 1;

	width = window.innerWidth;
	height = window.innerHeight;

	canvas.width = width * dpr;
	canvas.height = height * dpr;

	context.scale( dpr, dpr );

}

function redraw() {

  paint();

  requestAnimationFrame( redraw );

}

function paint() {

  context.clearRect( 0, 0, width, height );

  if( currentFocus ) {

    // Add to the tail
    tail.push( { ...head } );
    if( tail.length > TAIL_LENGTH ) tail.shift();

    // Paint the tail
    if( tail.length > 3 ) {

      context.beginPath();
      context.moveTo( tail[0].x, tail[0].y );

      for( var i = 2; i < tail.length - 2; i++ ) {
        const p1 = tail[i];
        const p2 = tail[i+1];

        context.quadraticCurveTo(
          p1.x, p1.y,
          ( p1.x + p2.x ) / 2,
          ( p1.y + p2.y ) / 2
        );
      }

      context.quadraticCurveTo(
        tail[i].x, tail[i].y,
        tail[i+1].x, tail[i+1].y
      );

      context.lineWidth = RADIUS;
      context.lineCap = 'round';
      context.strokeStyle = 'hsl(218deg 92% 50%)';
      context.stroke();
    }

    head.tr = currentFocus.classList.contains( 'valid' ) ? CHECK_RADIUS : RADIUS;

    // Animate the head towards its target values
    head.x += ( head.tx - head.x ) * 0.2;
    head.y += ( head.ty - head.y ) * 0.2;
    head.r += ( head.tr - head.r ) * 0.2;

    head.vx *= 0.8;
    head.x += head.vx;

    context.beginPath();
    context.arc( head.x, head.y, head.r, 0, Math.PI*2 );
    context.fillStyle = 'hsl(218deg 92% 57%)';
    context.fill();

  }

  for( [inputElement, checkmark] of checkMarks ) {
    checkmark.v += ( checkmark.tv - checkmark.v ) * 0.2;

    if( checkmark.v > 0.05 ) {
      const midX = inputElement.offsetLeft - CHECK_SIZE/2 - SPACING - 3;
      const midY = inputElement.offsetTop + inputElement.offsetHeight/2 + 1;

      context.save();
      context.beginPath();
      context.moveTo( midX + CHECK_SIZE/2, midY - CHECK_SIZE/2 );
      context.lineTo( midX - 1, midY + CHECK_SIZE/2 - 1 );
      context.lineTo( midX - CHECK_SIZE/2, midY ); 

      context.lineWidth = 3;
      context.lineCap = 'round';
      context.lineJoin = 'round'; 
      context.setLineDash([18, 18]);
      context.lineDashOffset = 18 + Math.round( checkmark.v * 18 );

      context.globalCompositeOperation = 'lighter';
      context.strokeStyle = '#555';
      context.stroke();

      context.globalCompositeOperation = 'overlay';
      context.strokeStyle = '#fff';
      context.stroke(); 

      context.restore();

    }
  }

}

function focus( element ) {

  const previousFocus = currentFocus;

  if( element ) currentFocus = element;

  if( !currentFocus ) return;

  head.tx = currentFocus.offsetLeft - SPACING - RADIUS;
  head.ty = currentFocus.offsetTop + currentFocus.offsetHeight/2;

  if( typeof head.x !== 'number' ) {
    head.x = head.tx;
    head.y = head.ty;
  }

  if( currentFocus !== previousFocus ) {
    head.vx = -8 - Math.abs( head.tx - head.x ) / 5;
  }

}

function validate( element ) {

  let valid = false;

  switch( element.getAttribute( 'type' ) ) {
    case 'email': valid = /(.+)@(.+){2,}\.(.+){2,}/.test( element.value ); break;
    case 'password': valid = element.value.length > 6; break;
    default: valid = element.value.length > 2; break;
  }

  element.classList.toggle( 'valid', valid );

  const checkmark = checkMarks.get( element );
  if( checkmark ) {
    checkmark.tv = valid ? 1 : 0;
  }

}

resize();
redraw();

window.addEventListener( 'resize', () => {
  requestAnimationFrame( () => {
    resize();
    focus();
    paint();
  } );
} );

window.addEventListener( 'scroll', () => {
  requestAnimationFrame( () => {
    focus();
    paint();
  } );
} );

