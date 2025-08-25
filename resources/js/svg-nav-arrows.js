// function to draw arrows between link items, responding to
// changing sizes and positions
function drawArrows() {
	const svg = document.getElementById('cohomological-arrows');
	const navItems = document.querySelectorAll('nav ul li');
	const svgNS = "http://www.w3.org/2000/svg";

	svg.innerHTML = '';

	const svgRect = svg.getBoundingClientRect();

	for (let i = 0; i < navItems.length - 1; i++) {
		const from = navItems[i].getBoundingClientRect();
		const to = navItems[i + 1].getBoundingClientRect();

		// we obtain coordinates centered at svgRect. This way we
		// can seamlessly construct the line by appending at svg.
		const x1 = from.right - svgRect.left; 
		const y1 = from.top + from.height / 2 - svgRect.top;
		const x2 = to.left - svgRect.left;
		const y2 = to.top + to.height / 2 - svgRect.top;

		//scaling the arrow size relative to viewport width.
		//Otherwise the arrows can look pretty bad. I tried
		//relative to svg.getBoundingClientRect().height and others
		//but it didn't look so nice. Also the dimensions of the
		//from variables vary, so that's not a good candidate.
		const arrowOffset = window.innerWidth * 0.012;
		const arrowSize = Math.min(8, window.innerWidth * 0.008);
		const line = document.createElementNS(svgNS, 'line');
		line.setAttribute('x1', x1);
		line.setAttribute('y1', y1);
		//stop the arrow a little bit before it hits the next word
		line.setAttribute('x2', x2 - arrowOffset); 
		line.setAttribute('y2', y2);
		line.setAttribute('stroke', 'grey');
		line.setAttribute('stroke-width', arrowSize / 2);

		const arrow = document.createElementNS(svgNS, 'polygon');
		// a small horizontal offset makes the arrow look better.
		arrow.setAttribute('points', `
		${x2},${y2}
		${x2 - arrowOffset},${y2 - arrowSize}
		${x2 - arrowOffset},${y2 + arrowSize}
	 `);
		arrow.setAttribute('fill', 'grey');

		svg.appendChild(line);
		svg.appendChild(arrow);
	}
}

// Run once on load and again on resize
window.addEventListener('load', drawArrows);
window.addEventListener('resize', drawArrows);
