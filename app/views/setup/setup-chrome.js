opus.Gizmo({
	name: "setup",
	dropTarget: true,
	type: "Palm.Mojo.Panel",
	h: "100%",
	styles: {
		zIndex: 2
	},
	chrome: [
		{
			name: "pageHeader1",
			title: "Setup",
			type: "Palm.Mojo.PageHeader",
			l: 0,
			t: 0
		},
		{
			name: "group1",
			dropTarget: true,
			label: "Account Info",
			type: "Palm.Mojo.Group",
			l: 0,
			t: 83,
			b: "",
			h: "auto",
			controls: [
				{
					name: "row1",
					dropTarget: true,
					rowType: "first",
					isTextField: true,
					type: "Palm.Mojo.Row",
					l: 0,
					t: 0,
					controls: [
						{
							name: "username",
							hintText: "Username",
							autoReplace: false,
							textCase: "cap-lowercase",
							type: "Palm.Mojo.TextField",
							l: 0,
							t: 0
						}
					]
				},
				{
					name: "row5",
					dropTarget: true,
					rowType: "last",
					isTextField: true,
					type: "Palm.Mojo.Row",
					l: 0,
					t: 52,
					controls: [
						{
							name: "password",
							hintText: "Password",
							enterSubmits: true,
							requiresEnterKey: true,
							autoReplace: false,
							textCase: "cap-lowercase",
							onchange: "authUser",
							type: "Palm.Mojo.PasswordField",
							l: 0,
							t: 0
						}
					]
				}
			]
		},
		{
			name: "saveButton",
			ontap: "authUser",
			disabled: undefined,
			label: "Save",
			type: "Palm.Mojo.ActivityButton",
			l: 0,
			t: 199
		}
	]
});