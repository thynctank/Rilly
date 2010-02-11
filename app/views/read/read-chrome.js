opus.Gizmo({
	name: "read",
	dropTarget: true,
	type: "Palm.Mojo.Panel",
	l: 0,
	t: 0,
	h: "100%",
	styles: {
		zIndex: 2
	},
	chrome: [
		{
			name: "web",
			plane: "0",
			modelName: "web",
			virtualpageheight: "100%",
			virtualpagewidth: "100%",
			minFontSize: "11",
			interrogateClicks: false,
			showClickedLink: false,
			type: "Palm.Mojo.WebView",
			l: 0,
			t: 0,
			h: "100%"
		}
	]
});