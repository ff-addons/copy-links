var gCopyLinks = {

	GetLinks : function(bSelected /*, reMask*/) {
		var focusedWindow = document.commandDispatcher.focusedWindow;
		var focusedDoc = document.commandDispatcher.focusedWindow.document;
		var argc = gCopyLinks.GetLinks.arguments.length;
		var argv = gCopyLinks.GetLinks.arguments;
		var reMask;

		var selLinks = [];
		var i, j = 0;

		if (argc > 1)
			reMask = new RegExp(argv[1], 'i');

		for (i = 0;i < focusedDoc.links.length;i++) {
			if ((!bSelected || focusedWindow.getSelection().containsNode(focusedDoc.links[i], true)) &&
				(argc <= 1 || focusedDoc.links[i].href.match(reMask)))
			{
				selLinks[j] = focusedDoc.links[i].href;
				j++;
			}
		}

		return selLinks;
	}
,
	EOL : function() {
		platform = navigator.platform.toLowerCase();
		if (platform.indexOf('win') != -1)
			return "\r\n"; //CR LF
		else if (platform.indexOf('mac') != -1)
			return "\r"; //CR
		else if (platform.indexOf('unix') != -1
				|| platform.indexOf('linux') != -1
				|| platform.indexOf('sun') != -1)
			return "\n"; //LF
	}
,
	CopyToClipboard : function(copyThis) {
		var str = Components.classes["@mozilla.org/supports-string;1"].createInstance(Components.interfaces.nsISupportsString);
		if (!str) return false;
		str.data = copyThis; // unicode string?

		var trans = Components.classes["@mozilla.org/widget/transferable;1"].createInstance(Components.interfaces.nsITransferable);
		if (!trans) return false; //no transferable widget found

		trans.addDataFlavor("text/unicode");
		trans.setTransferData("text/unicode", str, copyThis.length*2);

		var clipid=Components.interfaces.nsIClipboard;
		var clip = Components.classes["@mozilla.org/widget/clipboard;1"].getService(clipid);
		if (!clip) return false; // couldn't get the clipboard

		clip.setData(trans, null, clipid.kGlobalClipboard);
		return true;
	}
,
	OnCommand : function(cmd) {
		var links;
		var i;

		switch (cmd) {
			case 'all':
				links = gCopyLinks.GetLinks(false);
				break;
			case 'sel':
				links = gCopyLinks.GetLinks(true);
				break;
			default:
				return;
		}

		if (links.length == 0)
			return;

		var copytext = '';

		for (i = 0;i < links.length;i++)
			copytext += links[i] + gCopyLinks.EOL();

		gCopyLinks.CopyToClipboard(copytext);
	}
,
	FindNextVisibleSibling : function(menuitem) {
		while (menuitem = menuitem.nextSibling)
			if (!menuitem.hidden)
				return menuitem;
		return null;
	}
,
	PrepareMenu : function() {
		var isSelected = document.commandDispatcher.focusedWindow.getSelection().toString() != '';
		document.getElementById("CopyLinks-sel").hidden = !isSelected;
		document.getElementById("CopyLinks-sel-edit").hidden = !isSelected;
	}
,
	UpdateMenu : function() {
		var menuitem = gCopyLinks.FindNextVisibleSibling(document.getElementById("context-sep-copylink"));
		document.getElementById("context-sep-copylink").hidden = (!menuitem || menuitem.tagName == 'menuseparator');
	}
,
	Init : function() {
		document.getElementById("contentAreaContextMenu").addEventListener("popupshowing", gCopyLinks.PrepareMenu, false);
		document.getElementById("contentAreaContextMenu").addEventListener("popupshown", gCopyLinks.UpdateMenu, false);
		document.getElementById("menu_EditPopup").addEventListener("popupshowing", gCopyLinks.PrepareMenu, false);
	}

};

window.addEventListener("load", gCopyLinks.Init, false);
