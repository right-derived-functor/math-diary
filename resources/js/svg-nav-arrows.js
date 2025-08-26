const navItems = document.querySelectorAll('nav ul li');

// returns the vertical gap from item index in nav to the previous item in nav. Input any index of navItems greater than 0.
function getVerticalGapFromPrev(index) {
	if (typeof index !== "number" || index <= 0 || index >= navItems.length)
		throw new Error (`Invalid index ${index}. Must be between 1 and the index of the last nav item ${navItems.length - 1}`);

	return navItems[index].getBoundingClientRect().top - navItems[index - 1].getBoundingClientRect().top;
}

// function to detect if item index in nav is the first item in a new row. Input any index of navItems greater than 0.
function isFirstWrap(index) {
	if (typeof index !== "number" || index <= 0 || index >= navItems.length)
		throw new Error (`Invalid index ${index}. Must be between 1 and the index of the last nav item ${navItems.length - 1}`);

	return getVerticalGapFromPrev(index) > 0;
}

// if an item is first wrap, shift it to the right.
function shiftItem() {
	for (let i = 1; i < navItems.length; i++) {
		if (isFirstWrap(i)) {
			navItems[i].style.marginLeft = `${getVerticalGapFromPrev(i)/2}px`;
		} 
	}
}

function drawArrows() {
	const svg = document.getElementById('cohomological-arrows');
	const svgNS = "http://www.w3.org/2000/svg";
	svg.innerHTML = '';
	const svgRect = svg.getBoundingClientRect();
	const navBar = document.querySelector('nav ul');
	leftMostX = navBar.getBoundingClientRect().left;
	rightMostX = navBar.getBoundingClientRect().right;

	for (let i = 0; i < navItems.length - 1; i++) {
		const from = navItems[i].getBoundingClientRect();
		const to = navItems[i + 1].getBoundingClientRect();

		const x1 = from.right - svgRect.left;
		const y1 = from.top + from.height / 2 - svgRect.top;
		const x2 = to.left - svgRect.left;
		const y2 = to.top + to.height / 2 - svgRect.top;

		const arrowOffset = window.innerWidth * 0.012;
		const arrowSize = Math.min(8, window.innerWidth * 0.008);

		let path, pathColor, strokeWidth;
		if (isFirstWrap(i+1)) {
			const quarterVerticalGap = (y2 - y1) / 4;
			const midY = y1 + 2 * quarterVerticalGap;

			//winding path down to the next item.
			path = `
			M ${x1} ${y1}
			L ${rightMostX} ${y1}
			A ${quarterVerticalGap} ${quarterVerticalGap} ${0} ${0} ${1} ${rightMostX} ${midY}
			L ${leftMostX} ${midY}
			A ${quarterVerticalGap} ${quarterVerticalGap} ${0} ${0} ${0} ${leftMostX} ${y2}
			L ${x2 - arrowOffset} ${y2}
			`;
			pathColor = 'hsla(322, 80%, 60%, 0.8)';
			strokeWidth = 2 * arrowSize / 3;
		}
		else {
			//straight line from --> to
			path = `M ${x1} ${y1} L ${x2 - arrowOffset} ${y2}`;
			pathColor = 'gray';
			strokeWidth = arrowSize / 2;

		} 

		// arrow path
		const pathEl = document.createElementNS(svgNS, 'path');
		pathEl.setAttribute('d', path);
		pathEl.setAttribute('fill', 'none');
		pathEl.setAttribute('stroke', pathColor);
		pathEl.setAttribute('stroke-width', strokeWidth);

		// arrowhead
		const arrow = document.createElementNS(svgNS, 'polygon');
		arrow.setAttribute('points', `
		${x2},${y2}
		${x2 - arrowOffset},${y2 - arrowSize}
		${x2 - arrowOffset},${y2 + arrowSize}
	 `);
		arrow.setAttribute('fill', pathColor);

		if (isFirstWrap)

		svg.appendChild(pathEl);
		svg.appendChild(arrow);
	}
}

window.addEventListener('load', shiftItem);
window.addEventListener('resize', shiftItem);
window.addEventListener('load', drawArrows);
window.addEventListener('resize', drawArrows);
