// ============================
// GrowthCloud Automation
// n8n Code Function (Docs: https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.code)
// Integration: Zoho
// Data Source: Zoho Contacts
// Description: Takes all items returned from the Zoho API and sanitizes their keys
// Author: Brandon Hudson
// Date: 10/21/2022
// Version: 1.0
// ============================

/**
 * Creates a new UUID
 */
function uuid() {
	var dt = new Date().getTime();
	var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		var r = (dt + Math.random() * 16) % 16 | 0;
		dt = Math.floor(dt / 16);
		return (c == 'x' ? r : (r & 0x3) | 0x8).toString(16);
	});
	return uuid;
}

let itemData = $input.item.json;

//console.log(itemData);

let keys = Object.keys(itemData);

//console.log('Running for item');

for (let i = 0; i < keys.length; i++) {
	//console.log(`Mapping ${i + 1} of ${keys.length}  keys...`);

	// Replace all $ in the keys of the object so that it is MongoDB compliant
	if (keys[i].includes('$')) {
		itemData[`${keys[i].replace('$', 'Zoho_')}`] = itemData[keys[i]];
		delete itemData[keys[i]];
	}

	// Map Zoho id field to ZohoID in GrowthCloud
	if (keys[i] == 'id') {
		itemData[`${keys[i].replace('id', 'ZohoID')}`] = itemData[keys[i]];
		delete itemData[keys[i]];
	}

	// Make email address lowercase
	if (keys[i] == 'Email') {
		if (itemData['Email']) {
			let email = itemData['Email'].toLowerCase();

			itemData[`Email`] = [
				{
					Email: email,
					Primary: true,
					Type: {
						label: 'Other',
						value: 'Other',
						color: '#B4B3AE',
					},
					Description: '',
					id: uuid(),
				},
			];
		} else {
			itemData['Email'] = [];
		}
	}

	// Lowercase emails in all subobjects
	if (
		typeof itemData[keys[i]] == 'object' &&
		itemData[keys[i]] &&
		itemData[keys[i]].hasOwnProperty('email')
	) {
		if (itemData[keys[i]][`email`]) {
			let email = itemData[keys[i]][`email`].toLowerCase();

			itemData[keys[i]][`email`] = [
				{
					Email: email,
					Primary: true,
					Type: {
						label: 'Other',
						value: 'Other',
						color: '#B4B3AE',
					},
					Description: '',
					id: uuid(),
				},
			];
		} else {
			itemData[keys[i]][`email`] = [];
		}
	}

	// TODO: Format mobile
}

return $input.item;
