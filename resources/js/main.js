window.myApp = {
	onWindowClose: () => {
		Neutralino.app.exit();
	}
};

function closeApp() {
	Neutralino.app.exit();
}

function minimizeApp() {
	Neutralino.window.minimize();
}

async function maximizeApp() {
	let isMaximized = await Neutralino.window.isMaximized();
	let closeBtn = document.getElementById("maximize-button");
	if (isMaximized) {
		Neutralino.window.unmaximize();
		closeBtn.innerText = "Max";
	}
	else {
		Neutralino.window.maximize();
		closeBtn.innerText = "Res";
	}
}

Neutralino.window.setDraggableRegion("title");
Neutralino.window.setDraggableRegion("menu-bar");

Neutralino.init();

Neutralino.events.on("windowClose", myApp.onWindowClose);
Neutralino.events.on("ready", () => {});

const weapons_json = getWeapons();
const armor_json = getArmor();
const skillmods_json = getSkillmods();

const weaponObj = {
	damageType: 1,
	armorPiercing: 0,
	template: "object/weapon/ranged/pistol/pistol_cdef.iff",
	skillMods: {
		0: "none",
		1: "none",
		2: "none",
		3: "none",
	}
}

const armorObj = {
	armorRating: 0,
	template: "object/tangible/wearables/armor/composite/armor_composite_bicep_l.iff",
	skillMods: {
		0: "none",
		1: "none",
		2: "none",
		3: "none",
	}
}

function initializeOutput(type) {
	document.querySelector("#" + type + "-copyText").onclick = function () {
		var output = getOutput(type);
		output = document.getElementById(type + "-output");
		output.select();
		document.execCommand('copy');
		output.value = "Copied!";
		output.disabled = true;
		setTimeout(function () { output.disabled = false; }, 1000);
		setTimeout(function () { drawTemplate(type); }, 1000);
	}
}
initializeOutput("weapon");
initializeOutput("armor");

const weaponData = document.querySelectorAll(".weapon-data");
const weaponTypeSelect = document.querySelector('#weapon-typeSelect');
const weaponTemplateSelect = document.querySelector('#weapon-templateSelect');
const weaponDamageTypeSelect = document.querySelector('#weapon-damageTypeSelect');
const weaponArmorPiercingSelect = document.querySelector('#weapon-armorPiercingSelect');
const weaponForceCostInput = document.querySelector('#weapon-forceCost');

const armorData = document.querySelectorAll(".armor-data");
const armorTypeSelect = document.querySelector('#armor-typeSelect');
const armorTemplateSelect = document.querySelector('#armor-templateSelect');
const armorSetCheckbox = document.querySelector('#armor-setCheckbox');
const armorRatingSelect = document.querySelector('#armor-ratingSelect');
const armorSocketsInput = document.querySelector('#armor-sockets');

function initializeDataListeners(type) {
	dataObj = getOutputData(type);
	dataObj.forEach(function (data) {
		switch (data.localName) {
			case "input":
				data.addEventListener('input', function () {
					validateValue(data, type);
				});
				addRequirements(data);
				break;
			case "select":
				data.addEventListener('input', function () {
					validateSkillMods(data, type);
				});
				break;
			default:
				break;
		}
	});
}
initializeDataListeners("weapon");
initializeDataListeners("armor");

function addRequirements(data) {
	var reqText = '<span id="' + data.id + 'Requirements" class="requirements">Minimum: <strong>';
	reqText += data.getAttribute("min") + '</strong> - Maximum: <strong>';
	reqText += data.getAttribute("max") + '</strong></span>';
	data.insertAdjacentHTML("afterend", reqText);
}

function addSelectListener(select, type, obj, val) {
	select.addEventListener('change', (event) => {
		obj[val] = select.value;
		drawTemplate(type);
	});
}
addSelectListener(weaponTemplateSelect, "weapon", weaponObj, "template");
addSelectListener(weaponDamageTypeSelect, "weapon", weaponObj, "damageType");
addSelectListener(weaponArmorPiercingSelect, "weapon", weaponObj, "armorPiercing");
addSelectListener(armorTemplateSelect, "armor", armorObj, "template");
addSelectListener(armorRatingSelect, "armor", armorObj, "armorRating");

armorSetCheckbox.addEventListener('change', (event) => {
	if (!armorSetCheckbox.checked)
		armorTemplateSelect.removeAttribute("disabled");
	else
		armorTemplateSelect.setAttribute("disabled", "true");
	drawTemplate("armor");
});

function addTemplateSelectListener(select, json_arr, type) {
	select.addEventListener('input', (event) => {
		populateTemplateSelect(json_arr, type, select.value);
		switch (type) {
			case "weapon":
				enableInputOnType(weaponForceCostInput, "Lightsaber", select.value);
				break;
			case "armor":
				disableCheckboxOnType(armorSetCheckbox, "PSG", select.value);
				disableInputOnType(armorSocketsInput, "PSG", select.value);
				break;
		}
		drawTemplate(type);
	});
}
addTemplateSelectListener(weaponTypeSelect, weapons_json, "weapon");
addTemplateSelectListener(armorTypeSelect, armor_json, "armor");

function populateTypeSelect(json_arr, arr_type) {
	var selectOutput = "";
	for (var key in json_arr)
		selectOutput += '<option value="' + key + '"">' + key + '</option>';
	document.getElementById(arr_type + "-typeSelect").innerHTML = selectOutput;
}
populateTypeSelect(weapons_json, "weapon");
populateTypeSelect(armor_json, "armor");

function populateTemplateSelect(json_arr, type, typeValue) {
	var selectOutput = "";
	for (var key in json_arr[typeValue])
		selectOutput += '<option value="' + json_arr[typeValue][key].template + '">' + json_arr[typeValue][key].name + '</option>';
	document.getElementById(type + "-templateSelect").innerHTML = selectOutput;
	// Set template for drawning output when switching type
	var obj = getObjectOfType(type);
	obj.template = json_arr[typeValue][0].template;
}
populateTemplateSelect(weapons_json, "weapon", "Pistols");
populateTemplateSelect(armor_json, "armor", "Composite");

function populateSkillMods(json_arr, type, entry, typeValue) {
	var selectOutput = "";
	for (var key in json_arr[typeValue])
		selectOutput += '<option value="' + json_arr[typeValue][key].template + '">' + json_arr[typeValue][key].name + '</option>';
	document.getElementById(type + "-skillModType-" + entry).innerHTML = selectOutput;
}
populateSkillMods(skillmods_json, "weapon", "01", "Skill Mods");
populateSkillMods(skillmods_json, "weapon", "02", "Skill Mods");
populateSkillMods(skillmods_json, "weapon", "03", "Skill Mods");
populateSkillMods(skillmods_json, "weapon", "04", "Skill Mods");
populateSkillMods(skillmods_json, "armor", "01", "Skill Mods");
populateSkillMods(skillmods_json, "armor", "02", "Skill Mods");
populateSkillMods(skillmods_json, "armor", "03", "Skill Mods");
populateSkillMods(skillmods_json, "armor", "04", "Skill Mods");

function drawArmorSet() {
	var armorSetString = "";
	var armorSet = armorTypeSelect.value;
	for (var key in armor_json[armorSet])
		armorSetString += armor_json[armorSet][key].template + " "
	return armorSetString;
}

function disableCheckboxOnType(checkbox, template, val) {
	if (val != template) {
		checkbox.removeAttribute("disabled");
	} else {
		checkbox.checked = false;
		checkbox.setAttribute("disabled", "true");
	}
}

function enableInputOnType(input, template, val) {
	if (val != template)
		input.setAttribute("disabled", "true");
	else
		input.removeAttribute("disabled");
}

function disableInputOnType(input, template, val) {
	if (val != template)
		input.removeAttribute("disabled");
	else
		input.setAttribute("disabled", "true");
}

function drawTemplate(type) {
	var output = getOutput(type);
	var outputString = "/generateEquipment " + type + " " + concatOutputValue(type);
	output.value = outputString;
}

function concatOutputValue(type) {
	var inputData = getOutputData(type);
	var drawString = "";

	inputData.forEach(function (data) {
		drawString += data.value + " ";
	});

	switch (type) {
		case "weapon":
			return weaponObj.template + " " + weaponObj.damageType + " " + weaponObj.armorPiercing + " " + drawString;
		case "armor":
			if (!armorSetCheckbox.checked)
				return armorObj.armorRating + " " + drawString + armorObj.template;
			else
				return armorObj.armorRating + " " + drawString + drawArmorSet();
		default:
			console.log("Unknown type in drawTemplate concatOutputValue");
			return "";
	}
}

function getObjectOfType(type) {
	switch (type) {
		case "weapon":
			return weaponObj;
		case "armor":
			return armorObj;
		default:
			console.log("Unknown type in getObjectOfType");
			return "";
	}
}

function getOutputData(type) {
	switch (type) {
		case "weapon":
			return weaponData;
		case "armor":
			return armorData;
		default:
			console.log("Unknown type in drawTemplate getOutputData");
			return "";
	}
}

function getOutput(type) {
	switch (type) {
		case "weapon":
			return weaponOutput;
		case "armor":
			return armorOutput;
		default:
			console.log("Unknown type in drawTemplate getOutput");
			return "";
	}
}

// Validation
function validateValue(obj, type) {
	var val = obj.value;
	var min = obj.getAttribute("min");
	var max = obj.getAttribute("max");
	if (val == "" || val == "-")
		return;
	if (Math.ceil(val) < min) {
		obj.value = min;
		obj.blur();
		alertInvalidated(obj);
	} else if (Math.ceil(val) > max) {
		obj.value = max;
		obj.blur();
		alertInvalidated(obj)
	}
	drawTemplate(type);
}

function validateSkillMods(data, type) {
	console.log(data);
	var val = data.value;
	var obj = getObjectOfType(type);
	if (val != "none") {
		var foundDuplicate = false;
		for (var key in obj["skillMods"]) {
			console.log(obj["skillMods"][key]);
			console.log(val);
			if (obj["skillMods"][key] == val) {
				foundDuplicate = true;
				break;
			}
		}
	}

	if (foundDuplicate) {
		data.value = obj["skillMods"][data.getAttribute("skillMod")];
		// Add warning
	} else {
		obj["skillMods"][data.getAttribute("skillMod")] = val;
		drawTemplate(type);
	}
}

function alertInvalidated(obj) {
	var requirementElement = document.getElementById(obj.id + "Requirements");
	requirementElement.classList.remove("textWarning");
	void requirementElement.offsetWidth;
	requirementElement.classList.add("textWarning");
}

// Navigation
function openTab(e, tab) {
	var i, tabcontent, tablinks, tabactive;

	tabcontent = document.getElementsByClassName("tab-content");
	for (i = 0; i < tabcontent.length; i++)
		tabcontent[i].style.display = "none";

	tablinks = document.getElementsByClassName("nav-tab");
	for (i = 0; i < tablinks.length; i++)
		tablinks[i].className = tablinks[i].className.replace(" active", "");

	tabactive = document.getElementById(tab + "-container");
	tabactive.style.display = "block";
	tabactive.classList.add("fadein");
	
	e.className += " active";
	document.body.className = tab;
}

document.querySelector("#toggleMode").onclick = function () {
	var html = document.getElementsByTagName("html")[0];
	toggleButton = document.getElementById("toggleMode");
	if (html.className == "dark-mode")
		toggleButton.innerHTML = "&#9790;";
	else
		toggleButton.innerHTML = "&#9788;";
	html.classList.toggle("dark-mode");
}