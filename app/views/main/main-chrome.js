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
			name: "panel1",
			layoutKind: "absolute",
			dropTarget: true,
			type: "Palm.Mojo.Panel",
			l: 0,
			t: "0",
			b: "",
			h: "100%",
			controls: [
				{
					name: "spinner",
					plane: "1000",
					type: "Palm.Mojo.LargeSpinner",
					l: "100",
					r: "",
					w: "128",
					t: "100",
					h: "128"
				},
				{
					name: "panel2",
					dropTarget: true,
					type: "Palm.Mojo.Panel",
					l: "0",
					r: "",
					t: "",
					b: "",
					h: "100%",
					controls: [
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
							t: 52,
							h: "0"
						},
						{
							name: "scroller",
							snapElements: [],
							type: "Palm.Mojo.Scroller",
							l: 0,
							t: 52,
							h: "100%",
							styles: {
								cursor: "move",
								overflow: "hidden"
							},
							controls: [
								{
									name: "readingList",
									dropTarget: true,
									items: [],
									useSampleData: false,
									itemHtml: "<div class=\"palm-row readingItem\">\n  <div x-mojo-element=\"CheckBox\" name=\"check\" class=\"checkboxClass\"></div>\n  <div class=\"itemTitle\">#{title}</div>\n</div>",
									onlisttap: "readItem",
									swipeToDelete: false,
									reorderable: false,
									rowFocusHighlight: false,
									type: "Palm.Mojo.List",
									l: 0,
									t: 0,
									h: 201
								}
							]
						}
					]
				}
			]
		}
	]
});