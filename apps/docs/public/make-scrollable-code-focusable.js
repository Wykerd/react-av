Array.from(document.querySelectorAll('pre, table')).forEach((element) => {
	element.setAttribute('tabindex', '0');
});
