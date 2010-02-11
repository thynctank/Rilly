opus.Gizmo({
	name: "main",
	dropTarget: true,
	type: "Palm.Mojo.Panel",
	h: "100%",
	styles: {
		zIndex: 2
	},
	chrome: [
		{
			name: "pageHeader1",
			title: "Your Reading List",
			type: "Palm.Mojo.PageHeader",
			l: 0,
			t: 0
		},
		{
			name: "filter",
			onfilter: "handleFilter",
			type: "Palm.Mojo.FilterField",
			l: 0,
			t: 51
		},
		{
			name: "scroller",
			mode: "vertical-snap",
			snapElements: [],
			type: "Palm.Mojo.Scroller",
			l: 0,
			t: 0,
			h: "100%",
			styles: {
				cursor: "move",
				overflow: "hidden"
			},
			controls: [
				{
					name: "readingList",
					dropTarget: true,
					items: "[]",
					useSampleData: false,
					itemHtml: "<div class=\"palm-row readingItem\">\n  <div x-mojo-element=\"CheckBox\" name=\"check\" class=\"checkboxClass\"></div>\n  <div class=\"itemTitle\">#{title}</div>\n</div>",
					onlisttap: "readItem",
					swipeToDelete: false,
					reorderable: false,
					rowFocusHighlight: false,
					type: "Palm.Mojo.List",
					l: 0,
					t: 0,
					h: 100
				}
			]
		}
	]
});