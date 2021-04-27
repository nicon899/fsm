let fsmList = [
	{ name: 'fsm_0', content: null },
];
let currentFsm = 0;
let restore = false;
let exportFileName = 'Finite State Machine Project';

window.onLoad = () => {
	updateFsmListLoad();
}

const onClickFsmItem = (index) => {
	currentFsm = index;
	restoreBackup(fsmList[index].content);
	updateFsmListLoad();
	draw();
}

const renameFsmItem = (index) => {
	const name = prompt("Enter a name:", fsmList[index].name);
	if (name) {
		fsmList[index].name = name;
		updateFsmListLoad();
	}
}

const updateFsmListLoad = () => {
	const list = document.getElementById('fsmList');
	while (list.firstChild) {
		list.removeChild(list.lastChild);
	}
	for (let i = 0; i < fsmList.length; i++) {
		const listItem = document.createElement("div");
		listItem.appendChild(document.createTextNode(fsmList[i].name));
		if (i === currentFsm) listItem.className = "selected"
		listItem.addEventListener('click', () => onClickFsmItem(i));
		listItem.addEventListener('dblclick', () => renameFsmItem(i));
		list.appendChild(listItem);
	}
}

const addFSM = () => {
	fsmList.push({ name: `fsm_${fsmList.length}`, content: null });
	currentFsm = fsmList.length - 1;
	updateFsmListLoad();
	clearCanvas();
}

function exportFsmList() {
	const filename = prompt("Enter an file name:", exportFileName);
	if (filename == null) return;
	var element = document.createElement('a');
	element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(fsmList)));
	element.setAttribute('download', filename);
	element.style.display = 'none';
	document.body.appendChild(element);
	element.click();
	document.body.removeChild(element);
}

function importFsmList() {
	restore = true;
	const fileInput = document.getElementById('fileInput');
	if (fileInput.files.length === 0) {
		console.log('No file selected.');
		return;
	}
	const reader = new FileReader();
	reader.onload = function fileReadCompleted() {
		exportFileName = fileInput.files[0].name;
		fsmList = JSON.parse(reader.result);
		currentFsm = 0;
		restoreBackup(fsmList[currentFsm].content);
		updateFsmListLoad();
		draw();
		restore = false;
	};
	reader.readAsText(fileInput.files[0]);
};

function restoreBackup(fsmBackup = null) {
	nodes = [];
	links = [];
	if (!localStorage && !fsmBackup) {
		return;
	}

	try {
		var backup = fsmBackup || JSON.parse(localStorage['fsm']);

		for (var i = 0; i < backup.nodes.length; i++) {
			var backupNode = backup.nodes[i];
			var node = new Node(backupNode.x, backupNode.y);
			node.isAcceptState = backupNode.isAcceptState;
			node.text = backupNode.text;
			nodes.push(node);
		}
		for (var i = 0; i < backup.links.length; i++) {
			var backupLink = backup.links[i];
			var link = null;
			if (backupLink.type == 'SelfLink') {
				link = new SelfLink(nodes[backupLink.node]);
				link.anchorAngle = backupLink.anchorAngle;
				link.text = backupLink.text;
			} else if (backupLink.type == 'StartLink') {
				link = new StartLink(nodes[backupLink.node]);
				link.deltaX = backupLink.deltaX;
				link.deltaY = backupLink.deltaY;
				link.text = backupLink.text;
			} else if (backupLink.type == 'Link') {
				link = new Link(nodes[backupLink.nodeA], nodes[backupLink.nodeB]);
				link.parallelPart = backupLink.parallelPart;
				link.perpendicularPart = backupLink.perpendicularPart;
				link.text = backupLink.text;
				link.lineAngleAdjust = backupLink.lineAngleAdjust;
			}
			if (link != null) {
				links.push(link);
			}
		}
	} catch (e) {
		localStorage['fsm'] = '';
	}
}

function saveBackup() {
	if (restore) return;

	var backup = {
		'nodes': [],
		'links': [],
	};
	for (var i = 0; i < nodes.length; i++) {
		var node = nodes[i];
		var backupNode = {
			'x': node.x,
			'y': node.y,
			'text': node.text,
			'isAcceptState': node.isAcceptState,
		};
		backup.nodes.push(backupNode);
	}
	for (var i = 0; i < links.length; i++) {
		var link = links[i];
		var backupLink = null;
		if (link instanceof SelfLink) {
			backupLink = {
				'type': 'SelfLink',
				'node': nodes.indexOf(link.node),
				'text': link.text,
				'anchorAngle': link.anchorAngle,
			};
		} else if (link instanceof StartLink) {
			backupLink = {
				'type': 'StartLink',
				'node': nodes.indexOf(link.node),
				'text': link.text,
				'deltaX': link.deltaX,
				'deltaY': link.deltaY,
			};
		} else if (link instanceof Link) {
			backupLink = {
				'type': 'Link',
				'nodeA': nodes.indexOf(link.nodeA),
				'nodeB': nodes.indexOf(link.nodeB),
				'text': link.text,
				'lineAngleAdjust': link.lineAngleAdjust,
				'parallelPart': link.parallelPart,
				'perpendicularPart': link.perpendicularPart,
			};
		}
		if (backupLink != null) {
			backup.links.push(backupLink);
		}
	}
	fsmList[currentFsm].content = backup;

	updateFsmListLoad();
	if (!localStorage || !JSON) {
		return;
	}

	localStorage['fsm'] = JSON.stringify(backup);
}
