function handle42Auth() {
	const timestamp = new Date().getTime();
	fetch('http://localhost:8000/api/42_intra_link', {
		method: 'GET',
		headers: {
			'Cache-Control': 'no-cache',
		},
	})
		.then(response => {
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
			return response.json();
		})
		.then(data => {
			console.log('Data fetched:', data);
			// Handle the fetched data
			forty_two_url = data.forty_two_url + `&state=${timestamp}` + `&random=${Math.random()}`;
			console.log(forty_two_url);
			window.location.href = forty_two_url;
		})
		.catch(error => {
			console.error('Error fetching data:', error);
		});
}

function handleLogout() {
	localStorage.clear();

	fetch('http://localhost:8000/logout', {
		credentials: 'include',
	})
		.then(response => {
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
			return response.json();
		})
		.then(data => {
			if (data.message === 'Logged out successfully') {
				document.getElementById('content').innerHTML = 'You have been logged out successfully';
			}
			else {
				document.getElementById('logout').remove();
			}
		})
		.catch(error => {
			console.error('Error fetching data:', error);
		});
}

document.addEventListener('DOMContentLoaded', () => {
	const dynamicLinks = document.querySelectorAll('.dynamic-link');

	dynamicLinks.forEach(link => {
		link.addEventListener('click', async event => {
			event.preventDefault();
			const route = event.target.getAttribute('href');
			console.log('Fetching data from:', route);
			await fetchBackendData(`http://localhost:8000${route}/`)
				.then(data => {
					console.log('Data fetched:', data);
					updateDataContainer(data);
				})
		});
	});
});

async function fetchBackendData(route) {

	return await fetch(route, {
		headers: {
			'Authorization': `Bearer ${localStorage.getItem('token') ? localStorage.getItem('token') : localStorage.getItem('access_token')}`,
		},
	})
		.then(response => {
			if (!response.ok) {
				if (response.status === 401 || response.status === 403) {
					alert('Unauthorized');
				} else {
					// alert(`Network response was not ok ${response.status}`);
				}
			}
			return response.text();
		});
}

function updateDataContainer(data) {
	// Update the UI with the fetched data
	const dataContainer = document.getElementById('data-container');

	dataContainer.innerHTML = data;

}

function handleToken() {
	const credentials = {
		username: 'ahassan',
		password: 'ahassan'
	};

	fetch('http://localhost:8000/token/', {
		method: 'POST',
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(credentials),
	})
		.then(response => {
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
			return response.json();
		})
		.then(data => {
			localStorage.setItem('token', data.access);
			localStorage.setItem('refresh', data.refresh);
			console.log('Data fetched:', data);
		})
		.catch(error => {
			alert(error);
		});
}

function getData() {
	let userData;
	fetch('http://localhost:8000/api/get_user_data/', {
		method: 'GET',
		headers: {
			'Authorization': `Bearer ${localStorage.getItem('token') ? localStorage.getItem('token') : localStorage.getItem('access_token')}`,
			'Content-Type': 'application/json'
		},
	})
		.then(response => {
			if (!response.ok) {
				response.statusText === 'Unauthorized' ? alert('Unauthorized') : alert('Network response was not ok');
			}
			return response.json();
		})
		.then(data => {
			userData = data[0];
			if (!userData) {
				console.log("No user data");
				return;
			}
			console.log("User data:", data);
			const container = document.getElementById("content");
			data.forEach((obj) => {
				Object.entries(obj).forEach((key, value) => {
					container.innerHTML +=
						"<p>" + key[0].toUpperCase() + ": " + key[1] + "</p>";
				});
			});

			const userPic = document.getElementById('user-pic');
			if (userData) {
				userPic.src = userData.picture.link;
				userPic.style.cssText = 'border: 2px solid black; margin: 10px; height: 100px; width: 100px; border-radius: 50%;'
			}
		})
}