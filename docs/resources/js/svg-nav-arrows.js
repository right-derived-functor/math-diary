// takes in a selector, such as ul li (importantly, we need the list items and something that wraps them). Then we dynamically attach arrows to all elements with that selector. When there are line breaks we have snake lemma style arrows. 
//There must be an svg element with class cohomological-arrows in the parent of ul, or whatever wraps the li's. Make sure the ul has relative position so we can position svg.cohomological arrows accordingly using absolute positioning.
//Sometimes the arrows won't appear if overflow is hidden
//Specify sizes and colors
// possibly the worst thing i've ever written
// NOTE: add some default values sometime
class CohomologicalList {
	constructor(selector, straightLineColor, snakeLineColor, straightLineWidthRatio, snakeLineWidthRatio, arrowSizeRatio, arrowOffsetRatio) {
		this.selector = selector;
		this.items = document.querySelectorAll(selector);
		this.straightLineColor = straightLineColor;
		this.snakeLineColor = snakeLineColor;
		this.straightLineWidthRatio = straightLineWidthRatio;
		this.snakeLineWidthRatio = snakeLineWidthRatio;
		this.arrowSizeRatio = arrowSizeRatio;
		this.arrowOffsetRatio = arrowOffsetRatio;
	}

	// returns the vertical gap from item index in nav to the previous item in nav. Input any index of this.items greater than 0.
	getVerticalGapFromPrev(index) {
		if (typeof index !== "number" || index <= 0 || index >= this.items.length)
			throw new Error (`Invalid index ${index}. Must be between 1 and the index of the last nav item ${this.items.length - 1}`);

		return this.items[index].getBoundingClientRect().top - this.items[index - 1].getBoundingClientRect().top;
	}

	// function to detect if item index in nav is the first item in a new row. Input any index of this.items greater than 0.
	 isFirstWrap(index) {
		if (typeof index !== "number" || index <= 0 || index >= this.items.length)
			throw new Error (`Invalid index ${index}. Must be between 1 and the index of the last nav item ${this.items.length - 1}`);

		return this.getVerticalGapFromPrev(index) > 0;
	}

	// if an item is first wrap, shift it to the right.
	 shiftItem() {
		let lastVerticalGap;
		for (let i = 1; i < this.items.length; i++) {
			if (this.isFirstWrap(i)) {
				lastVerticalGap = this.getVerticalGapFromPrev(i);
				this.items[i].style.marginLeft = `${lastVerticalGap/2}px`;
			}
			else {
				this.items[i].style.marginLeft = 0;
			}
		}
		document.getElementById("ellipses").style.marginLeft=`${lastVerticalGap/2}px`;
	}

	drawArrows() {
		const svgNS = "http://www.w3.org/2000/svg";
		const itemsParent = this.items[0].parentElement;
		const svg = itemsParent.parentElement.querySelector('svg.cohomological-arrows');
		console.log(itemsParent.parentElement);

//		const svg = document.getElementById('cohomological-arrows');
		svg.innerHTML = '';
		const svgRect = svg.getBoundingClientRect();

		const leftMostX = itemsParent.getBoundingClientRect().left;
		const rightMostX = itemsParent.getBoundingClientRect().right;

		for (let i = 0; i < this.items.length - 1; i++) {
			const from = this.items[i].getBoundingClientRect();
			const to = this.items[i + 1].getBoundingClientRect();

			const x1 = from.right - svgRect.left;
			const y1 = from.top + from.height / 2 - svgRect.top;
			const x2 = to.left - svgRect.left;
			const y2 = to.top + to.height / 2 - svgRect.top;

			const arrowOffset = window.innerWidth * this.arrowOffsetRatio; //0.012
			const arrowSize = window.innerWidth * this.arrowSizeRatio; //0.008

			let path, pathColor, strokeWidth;
			if (this.items[i + 1].style.display === "none"){
				return;
			}
			else if (this.isFirstWrap(i+1)) {
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
				pathColor = this.snakeLineColor //'hsla(322, 80%, 60%, 0.8)';
				strokeWidth = this.snakeLineWidthRatio * arrowSize; //3/4
			}
			else {
				//straight line from --> to
				path = `M ${x1} ${y1} L ${x2 - arrowOffset} ${y2}`;
				pathColor = this.straightLineColor; //'gray'
				strokeWidth = this.straightLineWidthRatio * arrowSize; //1/2

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
		${x2},${y2},
		${x2 - arrowOffset},${y2 - arrowSize}
		${x2 - arrowOffset},${y2 + arrowSize}
	 `);
			arrow.setAttribute('fill', pathColor);

			//			if (this.isFirstWrap(i))
			svg.appendChild(pathEl);
			svg.appendChild(arrow);
		}

		// custom event to control order of scripts running cuz this function breaks constantly ughhhhhh i HHAATEEEEE this function god it causes nothing but trouble can't ever have any good things but i love my arrows so worth i love u drawArrows even tho ur sooooo annoying
//		const event = new CustomEvent('arrowsDrawn', {detail: {list: this}}); document.dispatchEvent(event); it doesn't even work. i cannot
	}

	// find the index of the first element of the second row. If it doesn't exist return -1
	findSecondRowFirstWrap() {
		for (let i=2; i<this.items.length; i++) {
			if (this.isFirstWrap(i)) {
				return i;
			}
		}
		return -1;
	}

	// if there is more than one row after the first, and the first element of the second row is not an ellipsis, do the following: collapse the rest of the nav from and including the first element of the second row. Then change that element to an ellipsis. Furthermore change the ellipsis to an interactable "button" that expands the rest of the nav when clicked. Then the final ellipsis also becomes a link that applies this function when clicked.
	collapseNav() {	
		if (this.isCollapsible()) {
			let secondRowFirstIndex = this.findSecondRowFirstWrap();
			this.items.forEach((li, i) => {
				i > secondRowFirstIndex && (li.style.display = "none")
			});

			const secondRowFirstElement = this.items[secondRowFirstIndex];
			const ellipses = document.createElement("li");
			ellipses.textContent = "\\(\\cdots\\)";
			ellipses.style.cursor = "pointer";
			ellipses.style.width = "100%";
			console.log(secondRowFirstElement.offsetWidth);
			ellipses.classList.add('ellipses');
			ellipses.classList.add('ellipses-links');

			MathJax.typesetPromise([ellipses]);
			this.itemsParent = this.items[0].parentElement;
			ellipses.style.marginLeft = `${this.getVerticalGapFromPrev(secondRowFirstIndex)/2}px`;
			this.itemsParent.replaceChild(ellipses, this.items[secondRowFirstIndex]);
			this.items = document.querySelectorAll(this.selector);

			ellipses.addEventListener("click", () => {
				this.itemsParent.replaceChild(secondRowFirstElement, ellipses);
				this.items = document.querySelectorAll(this.selector);
				this.items.forEach((li, i) => {
					i > secondRowFirstIndex && (li.style.display = "");
				});
				this.shiftItem();
				this.drawArrows();
			});	
		}
		else{
			return;
		}
	}

	// detects when the nav bar is collapsible (see the rules written above the function collapseNav).
	isCollapsible() {
		let secondRowFirstIndex = this.findSecondRowFirstWrap();
		return (secondRowFirstIndex !== -1 && secondRowFirstIndex !== this.items.length - 1);
	}

	// if the nav is collapsible, turn the last ellipses into a button that collpases the nav
	toggleCollapseButton(){
		if (this.isCollapsible()) {
			const originalEllipses = document.getElementById("ellipses");
			originalEllipses.style.cursor = "pointer";
			originalEllipses.classList.add('ellipses-links');
			originalEllipses.addEventListener("click", () => {
				this.collapseNav();
				this.drawArrows();
			})


		}
	}
}

const navBar = new CohomologicalList('nav ul li', 'gray', 'hsla(322, 80%, 60%, 0.8)', 1/2, 3/4, 0.008, 0.012);

const lastfmBar = new CohomologicalList('#lastfm-categories li.lastfm-type, #lastfm-categories li.lastfm-time', 'gray', 'hsl(287, 45%, 58%)', 9/20, 2/5, 0.004, 0.008);

window.addEventListener('load', () => {
	navBar.shiftItem();
	navBar.toggleCollapseButton();
	navBar.collapseNav();
	navBar.drawArrows();
});

window.addEventListener('resize', () => {
	navBar.shiftItem();
	navBar.drawArrows();
});


window.addEventListener('load', () => {
	lastfmBar.shiftItem();
	lastfmBar.drawArrows();
});

window.addEventListener('resize', () => {
	lastfmBar.shiftItem();
	lastfmBar.drawArrows();
});

