const urlPageTitle = "Pong Os";
import { loadGame } from './pong.js';
import { loadTournament } from './tournament.js';
let userToken;
let user;
let isAuthDone = false;
if (sessionStorage.getItem('user')) {
	user = sessionStorage.getItem('user');
	user = JSON.parse(user)
	isAuthDone = true;
}

const viewUserProfile = (username) => {
	console.log(`Viewing profile for ${username}`);
	const url = `http://localhost:8000/api/users/${username}?username=${user.username}}`;

	fetch(url, {
		method: 'GET',
		headers: {
			'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
		},
	})
		.then(response => response.text())
		.then(data => {
			console.log(data);
			document.getElementsByClassName("window")[0].innerHTML = data;
			const addFriendButton = document.getElementById('add-friend');
			addFriendButton.addEventListener('click', async () => {
				addFriend(addFriendButton, user.username, username);
			});
		})
		.catch(error => {
			console.error('Error:', error);
		});
}

const addFriend = async (button, username, newFriend) => {
	console.log(`Forming friendship for ${username} with ${newFriend}`);
	try {
		const response = await fetch(`http://localhost:8000/api/toggle_friend/?user1=${username}&user2=${newFriend}`, {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
				'x-csrftoken': getCookie('csrftoken'),
			},
		});

		if (!response.ok) {
			fetch('/components/login.html').then(response => response.text()).then(data => {
				document.getElementById("content").innerHTML = data;
			});
			localStorage.clear();
			throw new Error(response.statusText === 'Unauthorized' ? 'Unauthorized' : 'Network response was not ok');
		}

		const data = await response.text();
		console.log("Data = ");
		console.log(data);
		if (data === 'Added') {
			button.innerHTML = 'Remove Friend';
			alert('Friend Added successfully :(');
		} else {
			button.innerHTML = 'Add Friend';
			alert('Friend Removed succesfully :)');
		}
	} catch (error) {
		console.error('Error:', error);
	}
}


// create document click that watches the nav links only
document.querySelector('#navbar').addEventListener("click", (e) => {
	const { target } = e;
	e.preventDefault();
	urlRoute();
});

function getCookie(name) {
	let cookieValue = null;
	if (document.cookie && document.cookie !== '') {
		const cookies = document.cookie.split(';');
		for (let i = 0; i < cookies.length; i++) {
			const cookie = cookies[i].trim();
			if (cookie.substring(0, name.length + 1) === name + '=') {
				cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
				break;
			}
		}
	}
	return cookieValue;
}

// create an object that maps the url to the template, title, and description
const urlRoutes = {
	404: {
		title: "404 | " + urlPageTitle,
		description: "Page not found",
	},
	"/": {
		title: "login | " + urlPageTitle,
		description: "This is the login page",
	},
	"/desktop": {
		title: "About Us | " + urlPageTitle,
		description: "This is the desktop page",
	},
	"/myprofile": {
		title: "myprofile | " + urlPageTitle,
		description: "This is the myprofile page",
	},
	"/play": {
		title: "play | " + urlPageTitle,
		description: "This is the play page",
	},
	"/users": {
		title: "users | " + urlPageTitle,
		description: "This is the users page",
	},
	"/profile": {
		title: "profile | " + urlPageTitle,
		description: "This is the profile page",
	},
};

const urlRoute = (event) => {
	event = event || window.event; // get window.event if event argument not provided
	event.preventDefault();
	let href = event.target.href;
	if (event.target.tagName !== 'A')
		href = event.target.parentElement.href;
	window.history.pushState({}, "", href);
	urlLocationHandler();
};

const insertCSS = (filePath) => {
	const link = document.createElement("link");
	link.rel = "stylesheet";
	link.href = filePath;
	document.head.appendChild(link);
};

// insertCSS("/assets/css/global.css");
// insertCSS("/assets/css/index.css");

function setMainWindowframe() {
	insertOrCreateContent();
	document.getElementById("content").innerHTML = `<div class="window-frame" id="main-window">
	<div class="top-bar">
	  <img class="top-bar-child" alt="" src="./assets/public/rectangle-4.svg" />

	  <div class="options">
		<img class="vector-icon" alt="" src="./assets/public/vector.svg" />

		<img class="dot-grid-icon" alt="" src="./assets/public/dot-grid.svg" />
	  </div>
	  </div>
		<div class="window"></div>
	</div>`;
}

let loadFile = function (event) {
	let image = document.getElementById('output');
	image.src = URL.createObjectURL(event.target.files[0]);
};

const urlLocationHandler = async () => {

	if (!isAuthDone) {
		localStorage.clear();
	}

	insertOrCreateContent();
	document.getElementById("content").innerHTML = ``;
	let location = window.location.pathname;
	if (location[location.length - 1] === '/') {
		location = location.slice(0, location.length - 1);
	}
	if (location.length == 0) {
		location = "/";
	}
	console.log('after login -> ', location);
	console.log('after login -> ', localStorage.getItem('access_token'));
	if (location === '/' && localStorage.getItem('access_token')) {
		console.log('desktop route');
		location = '/desktop';
	}
	if (!localStorage.getItem('access_token')) {
		console.log('no access route');
		location = '/';
	}
	const route = urlRoutes[location] || urlRoutes["404"];

	if (location === '/') {
		console.log('login route');
		if (document.getElementById("navbar")) {
			document.getElementById("navbar").remove();
		}
		await fetch('/components/login.html').then(response => response.text()).then(data => {
			document.getElementById("content").innerHTML = data;
		});
		return;
	}
	document.getElementById("navbar").style.display = 'flex';

	if (location === '/play') {
		setMainWindowframe();
		if (!document.getElementById("pongCanvas")) {
			const canvasElement = document.createElement('canvas');

			const canvasButtonOnline = document.createElement('button');
			const canvasButtonLocalGame = document.createElement('button');
			// const canvasButtonLocalTourn = document.createElement('button');


			document.getElementsByClassName('window')[0].appendChild(canvasElement);
			document.getElementsByClassName('window')[0].appendChild(canvasButtonOnline);
			document.getElementsByClassName('window')[0].appendChild(canvasButtonLocalGame);
			// document.getElementsByClassName('window')[0].appendChild(canvasButtonLocalTourn);


			console.log('canvasButtonOnline:', canvasButtonOnline);
			console.log('canvasButtonLocalGame:', canvasButtonLocalGame);
			// console.log('canvasButtonLocalTourn:', canvasButtonLocalTourn);


			canvasButtonOnline.id = 'startOnlineButton';
			canvasButtonOnline.innerHTML = 'Start Online Game';

			canvasButtonLocalGame.id = 'startLocalButton';
			canvasButtonLocalGame.innerHTML = 'Start Local Game';

			// canvasButtonLocalTourn.id = 'startLocalTournButton';
			// canvasButtonLocalTourn.innerHTML = 'Start Local Tournament';


			canvasElement.id = 'pongCanvas';
			loadGame();
		}
		document.title = route.title;
		return;
	}

	else if (location === '/tournament') {
		setMainWindowframe();

		if (!document.getElementById("pongCanvas")) {

			const canvasElement = document.createElement('canvas');
			const canvasButtonLocalTourn = document.createElement('button');
			const canvasButtonOnlineTourn = document.createElement('button');


			document.getElementsByClassName('window')[0].appendChild(canvasElement);
			document.getElementsByClassName('window')[0].appendChild(canvasButtonLocalTourn);
			document.getElementsByClassName('window')[0].appendChild(canvasButtonOnlineTourn);


			console.log('canvasButtonLocalTourn:', canvasButtonLocalTourn);
			console.log('canvasButtonOnlineTourn:', canvasButtonOnlineTourn);

			canvasButtonLocalTourn.id = 'startLocalTournButton';
			canvasButtonLocalTourn.innerHTML = 'Start Local Tournament';

			canvasButtonOnlineTourn.id = 'startOnlineTournButton';
			canvasButtonOnlineTourn.innerHTML = 'Start Online Tournament';

			canvasElement.id = 'pongCanvas';
			loadTournament(); // You may need to modify loadGame() to handle tournament-specific logic
		}
		document.title = route.title;
		return;
	}
	else if (location === '/desktop') {

		function openSmallWindow() {
			const width = 200;
			const height = 150;


			const left = Math.abs(Math.floor((Math.random() * window.innerWidth - width)) - 1000);
			const top = Math.abs(Math.floor((Math.random() * window.innerHeight - height / 2)) - 500);
			console.log(left, top);

			const windowFrame = document.createElement('div');
			windowFrame.className = 'small-window-frame';
			windowFrame.style.left = left + 'px';
			windowFrame.style.top = top + 'px';


			const topBar = document.createElement('div');
			topBar.className = 'small-top-bar';
			windowFrame.appendChild(topBar);


			const rectangleIcon = document.createElement('img');
			rectangleIcon.className = 'small-top-bar-child';
			rectangleIcon.src = './assets/public/rectangle-4.svg';
			topBar.appendChild(rectangleIcon);

			const options = document.createElement('div');
			options.className = 'small-options';
			topBar.appendChild(options);

			const vectorIcon = document.createElement('img');
			vectorIcon.className = 'small-vector-icon';
			vectorIcon.src = './assets/public/vector.svg';
			options.appendChild(vectorIcon);

			const dotGridIcon = document.createElement('img');
			dotGridIcon.className = 'small-dot-grid-icon';
			dotGridIcon.src = './assets/public/dot-grid.svg';
			options.appendChild(dotGridIcon);


			const windowContent = document.createElement('div');
			windowContent.className = 'small-window';


			const welcomeText = document.createElement('div');
			welcomeText.className = 'small-welcome-text';
			welcomeText.textContent = `Welcome ${user.username}!`;
			windowContent.appendChild(welcomeText);

			windowFrame.appendChild(windowContent);


			document.body.appendChild(windowFrame);


			windowFrame.style.display = 'block';



			setTimeout(() => {
				document.body.removeChild(windowFrame);
			}, 500);
		}


		const windowInterval = setInterval(openSmallWindow, 150);

		const location = window.location.pathname;

		setTimeout(() => {
			clearInterval(windowInterval);
		}, 1000);
	}
	else if (location === '/profile') {
		setMainWindowframe();

		await fetch(`http://localhost:8000/api/users/${user.username}?username=${user.username}`, {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
			},
		}).then(response => {
			if (!response.ok) {
				fetch('/components/login.html').then(response => response.text()).then(data => {
					document.getElementById("content").innerHTML = data;
				});
				localStorage.clear();
				response.statusText === 'Unauthorized' ? alert('Unauthorized') : alert('Network response was not ok');
			}
			return response.text();
		}).then(data => {
			// console.log(data);
			document.getElementsByClassName("window")[0].innerHTML = data;
			const maxSizeInBytes = 5 * 1024 * 1024; // 5 MB
			const imageContainer = document.getElementById('imageContainer');
			const uploadButton = document.getElementById('uploadButton');
			const hoverText = document.getElementById('hoverText');

			imageContainer.addEventListener('mouseover', function () {
				uploadButton.style.display = 'block';
				hoverText.style.display = 'block';
			});

			imageContainer.addEventListener('mouseout', function () {
				uploadButton.style.display = 'none';
				hoverText.style.display = 'none';
			});
			document.getElementById('file').addEventListener('change', loadFile, false);
			document.getElementById('uploadButton').addEventListener('click', async () => {
				let fileInput = document.getElementById('file');
				let file = fileInput.files[0];

				if (file) {
					if (file.size > maxSizeInBytes) {
						alert('File size is too large, Please choose a smaller file.');
						return;
					}
					let formData = new FormData();
					formData.append('image', file);
					formData.append('username', user.username);
					await fetch('http://localhost:8000/api/update_user_profile/', {
						method: 'POST',
						body: formData,
						headers: {
							'X-CSRFToken': getCookie('csrftoken'),
							'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
						},
						credentials: 'include',
					})
						.then(response => response.json())
						.then(data => {
							// inser success message
							console.log(data);
						})
						.catch(error => {
							console.error('Error:', error);
						});
				}
			});
			// updating display name
			const displayNameElement = document.getElementById('displayName');
			const hoverTextNick = document.getElementById('hoverText-nickname');
			displayNameElement.addEventListener('mouseover', function () {
				hoverTextNick.style.display = 'block';
			});

			displayNameElement.addEventListener('mouseout', function () {
				hoverTextNick.style.display = 'none';
			});
			displayNameElement.addEventListener('click', async () => {
				const newDisplayName = prompt('Enter new display name:');

				if (newDisplayName !== null) {
					try {
						const response = await fetch('http://localhost:8000/api/update_display_name/', {
							method: 'POST',
							headers: {
								'Content-Type': 'application/json',
								'X-CSRFToken': getCookie('csrftoken'),
								'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
							},
							credentials: 'include',
							body: JSON.stringify({ display_name: newDisplayName }),
						});

						if (response.ok) {
							displayNameElement.textContent = newDisplayName;
							console.log('Display name updated successfully');
						} else {
							console.error('Failed to update display name:', response.status, response.statusText);
						}
					} catch (error) {
						console.error('Error updating display name:', error);
					}
				}
			});

		}).catch((error) => {
			console.error('Error:', error);
		});

		document.getElementById('2fa-button').addEventListener('click', async () => {
			console.log(userId);

			try {
				const response = await fetch(`http://localhost:8000/enable_or_disable_2fa/?username=${user.username}`, {
					method: 'POST',
					headers: {
						'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
						'x-csrftoken': getCookie('csrftoken'),
					},
				});

				if (!response.ok) {
					fetch('/components/login.html').then(response => response.text()).then(data => {
						document.getElementById("content").innerHTML = data;
					});
					localStorage.clear();
					throw new Error(response.statusText === 'Unauthorized' ? 'Unauthorized' : 'Network response was not ok');
				}

				const data = await response.text();

				if (data === '2FA disabled successfully') {
					document.getElementById('2fa-button').innerHTML = 'Enable 2FA';
					alert('2FA disabled successfully');
				} else {
					await fetch('/components/login.html').then(response => response.text()).then(data => {
						document.getElementById("navbar").remove();
						document.getElementById("content").innerHTML = data;
						localStorage.clear();
					});
					alert('2FA enabled successfully, please login again')
				}
			} catch (error) {
				console.error('Error:', error);
			}
		});

	}
	else if (location === '/users') {
		setMainWindowframe();
		await fetch('/components/player-card.html').then(response => response.text()).then(data => {
			document.getElementsByClassName("window")[0].innerHTML = data;
		});
		let users = getAllUsers();

		const input = document.getElementById("search-user");
		users.then((data) => {
			users = data;
			insertAllUsers(users);
		});
		// handling search input
		input.addEventListener("keyup", () => {
			let inputValue = input.value;

			if (!inputValue) {
				insertAllUsers(users);
				return;
			}
			insertAllUsers(users.filter((user) => user.username.startsWith(inputValue)));
		});
	}
	if (document.getElementById("pongCanvas")) {

		const canvasElement = document.getElementById("pongCanvas");
		canvasElement.remove();
		const canvasButton = document.getElementById('startButton');
		canvasButton.remove();
	}

	document.title = route.title;
};

// add an event listener to the window that watches for url changes

// call the urlLocationHandler function to handle the initial url
handleUserData();

async function handleUserData() {


	const urlParams = new URLSearchParams(window.location.search);
	const code = urlParams.get('code');
	const url = new URL(window.location.href);
	url.search = '';
	const mainUrl = url.toString();

	history.replaceState({}, '', mainUrl);
	console.log('code', code)
	if (code) {
		document.getElementById("content").innerHTML = `
		<div id="spinner" class="d-flex justify-content-center" style="z-index: 15; top: 50%; color: white; margin-top: 50%;">
		<div class="spinner-border" role="status" style="width: 250px; height: 250px;">
		<span class="visually-hidden">Loading...</span>
		</div>
		<h1>login you in...</h1>
		</div>
		`;
		// document.getElementById("nav-container").classList.add("hidden");
		if (document.getElementById("navbar")) {
			document.getElementById("navbar").style.display = 'none';
		}
		console.log("starting fetching....");
		await fetch(`http://localhost:8000/auth/?code=${code}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		})
			.then(response => {
				console.log('response', response)
				if (!response.ok) {
					if (response.status === 400) {
						alert('Invalid code');
						fetch('/components/login.html').then(response => response.text()).then(data => {
							document.getElementById("content").innerHTML = data;
						});
						localStorage.clear();
						return;
					}
					response.statusText === 'Unauthorized' ? alert('Unauthorized') : alert('Network response was not ok');
					fetch('/components/login.html').then(response => response.text()).then(data => {
						document.getElementById("content").innerHTML = data;
					});
					localStorage.clear();
					return;
				}
				return response.json();
			}).then(data => {
				if (!data) {
					return;
				}
				if (data.message) {
					console.log('message', message)
					return;
				}
				userToken = data.token;
				user = data.user;
				sessionStorage.setItem('user', JSON.stringify(user));
				isAuthDone = true;
				const otp = data.otp
				if (otp === 'validate_otp') {
					console.log('validate otp');
					// setMainWindowframe();
					document.getElementById("content").innerHTML = `<div class="window-frame" id="main-window">
						<div class="top-bar">
						<img class="top-bar-child" alt="" src="./assets/public/rectangle-4.svg" />

						<div class="options">
						<img class="vector-icon" alt="" src="./assets/public/vector.svg" />

						<img class="dot-grid-icon" alt="" src="./assets/public/dot-grid.svg" />
						</div>
						</div>
						<div class="window"></div>
						</div>`;
					document.getElementsByClassName('window')[0].innerHTML = `
						<div class="mb-3 p-20px">
						<label for="otp-input" class="form-label">OTP Code</label>
						<input type="text" class="form-control" id="otp-input" placeholder="Enter OTP code">
						</div>
						<button type="submit-otp" id="submit-otp" class="btn btn-primary">Validate OTP</button>
						`;

					document.getElementById('submit-otp').addEventListener('click', async () => {
						let otp = document.getElementById('otp-input').value;
						if (!otp) {
							alert('Please enter OTP code');
							return;
						}
						const requestBody = new URLSearchParams();
						requestBody.append('username', data.user.username);
						requestBody.append('otp', otp);

						await fetch('http://localhost:8000/validate_otp/', {
							method: 'POST',
							headers: {
								'Content-Type': 'application/x-www-form-urlencoded',
								'Authorization': `Bearer ${userToken}`,
							},
							body: requestBody.toString(),
						})
							.then(response => {
								if (!response.ok) {
									fetch('/components/login.html').then(response => response.text()).then(data => {
										document.getElementById("content").innerHTML = data;
									});
									localStorage.clear();
									throw new Error(response.statusText === 'Unauthorized' ? 'Unauthorized' : 'Network response was not ok');
								}
								return response.json();
							})
							.then(data => {
								// Handle the response data here
								if (data.message === 'OTP is valid') {
									console.log(data);
									localStorage.setItem('access_token', userToken);
									document.getElementsByClassName("window")[0].innerHTML = '';
									alert('OTP is valid, enjoy pongos');
									// document.getElementById("navbar").style.display = 'none';
									window.history.pushState({}, "", '/desktop');

									window.onpopstate = urlLocationHandler;
									// call the urlLocationHandler function to handle the initial url
									window.route = urlRoute;
									urlLocationHandler();
									// return false;
								}
								else {
									alert('Invalid OTP code');
								}

							})
							.catch(error => {
								console.error('Error:', error);
							});
					});
					return;
				}
				let csrfToken = data.csrfToken
				if (userToken && user) {
					localStorage.setItem('access_token', userToken);
					localStorage.setItem('username', user.username);
					console.log(userToken);
					console.log(user);
					console.log(csrfToken);
					console.log(data.sessionId);
					// document.cookie = "sessionId=" + data.sessionId;
					// console.log('authDone', authDone)

				}


				window.history.pushState({}, "", '/desktop');

				window.onpopstate = urlLocationHandler;
				// call the urlLocationHandler function to handle the initial url
				window.route = urlRoute;
				urlLocationHandler();


			})
		return;
	}
	window.onpopstate = urlLocationHandler;
	// call the urlLocationHandler function to handle the initial url
	window.route = urlRoute;
	urlLocationHandler();

}


function insertOrCreateContent() {
	if (!document.getElementById("content")) {
		const content = document.createElement('div');
		content.id = 'content';
		document.body.appendChild(content);
	}
}


async function getAllUsers(override) {
	let location = window.location.pathname;
	if (location[location.length - 1] === '/') {
		location = location.slice(0, location.length - 1);
	}
	if (location !== '/users')
		return;
	let users;
	await fetch('http://localhost:8000/api/get_all_users/', {
		method: 'GET',
		headers: {
			'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
			'Content-Type': 'application/json'
		},
	}).then(response => {
		if (!response.ok) {
			if (response.status === 401 || response.status === 403) {
				localStorage.clear();
				document.cookie = 'csrftoken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
				document.cookie = 'sessionid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
				window.location.href = '/';
				return;
			}
			response.statusText === 'Unauthorized' ? alert('Unauthorized') : alert('Network response was not ok');
		}
		return response.json();
	}).then(data => {
		console.log(data);

		let sameUser = user['username'];
		users = data.filter(item => (item.username !== "admin" && item.username !== sameUser));
		console.log('filtered users -> ', users);
		return users;
	}).catch((error) => {
		console.error('Error:', error);
	});
	return users;
}
function elementExistsInArray(array, element) {
	for (let i = 0; i < array.length; i++) {
		if (array[i] === element) {
			return true;
		}
	}
	return false;
}
async function getAllFriends(override) {
	let location = window.location.pathname;
	if (location[location.length - 1] === '/') {
		location = location.slice(0, location.length - 1);
	}
	if (location !== '/users')
		return;
	let users = [];
	await fetch(`http://localhost:8000/api/friends/${user.username}`, {
		method: 'GET',
		headers: {
			'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
			'Content-Type': 'application/json'
		},
	}).then(response => {
		if (!response.ok) {
			if (response.status === 401 || response.status === 403) {
				localStorage.clear();
				document.cookie = 'csrftoken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
				document.cookie = 'sessionid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
				window.location.href = '/';
				return;
			}
			response.statusText === 'Unauthorized' ? alert('Unauthorized') : alert('Network response was not ok');
		}
		return response.json();
	}).then(data => {
		// console.log(data);
		users = data;
		console.log(users);
		return users;
	}).catch((error) => {
		console.error('Error:', error);
	});
	return users;
}



async function insertAllUsers(users) {
	document.getElementById('player-card-div').innerHTML = '';
	if (!users) {
		return;
	}
	let friends = await getAllFriends();
	//call getAllFriends here:
	console.log(friends);

	users.forEach(user => {
		let isFriend = false;
		console.log(user.username);
		isFriend = elementExistsInArray(friends, user.intra)
		const playerCard = `
			<div class="row p-0 g-0">
				<div class="col border border-1 border-dark ratio ratio-1x1">
					<div class="ratio ratio-1x1" style="background-color: rebeccapurple;">
						<img src="${user.image ? user.image : user.picture.link}" class="img-fluid rounded-circle" alt="...">
					</div>
				</div>
				<div class="col-6 border border-1 border-dark overflow-auto mh-100 mw-50">
					<ul class="list-group">
						<li class="list-group-item justify-content-left text-uppercase"><h4>${user.intra}</h4></li>
						<li class="list-group-item justify-content-left text-uppercase"><a>${user.is_online ? "online 🟢" : "offline ⚪"}</a></li>
						<li class="list-group-item justify-content-left text-uppercase"><h5>ranking</h5></li>
					</ul>
				</div>
				<div class="col border border-1 border-dark ratio ratio-1x1">
					<button class="h-100 w-100 btn btn-primary text-capitalize add-friend-btn" type="button">${isFriend ? "Remove Friend" : "Add Friend"}</button>
				</div>
				<div class="col border border-1 border-dark ratio ratio-1x1">
					<button class="h-100 w-100 btn btn-info text-capitalize view-profile-btn" type="button">View Profile</button>
				</div>
			</div>`;

		document.getElementById('player-card-div').innerHTML += playerCard;

	});
	const buttons = document.getElementsByClassName('view-profile-btn');
	for (let i = 0; i < buttons.length; i++) {
		const button = buttons[i];
		button.addEventListener('click', function () {
			viewUserProfile(users[i].username);
		});
	}
	const addFriendButtons = document.getElementsByClassName('add-friend-btn');
	for (let i = 0; i < addFriendButtons.length; i++) {
		const button = addFriendButtons[i];
		button.addEventListener('click', function () {
			addFriend(button, user.username, users[i].username);
		});
	}
}

// window.addEventListener('beforeunload', function (event) {
// 	// Perform actions before the page is unloaded (e.g., show a confirmation dialog)
// 	// You can return a string to display a custom confirmation message
// 	const confirmationMessage = 'Are you sure you want to leave?';
// 	(event || window.event).returnValue = confirmationMessage; // Standard for most browsers
// 	return confirmationMessage; // For some older browsers
// });


// window.addEventListener('beforeunload', function (event) {
// 	// Perform actions before the page is unloaded (e.g., show a confirmation dialog)
// 	// You can return a string to display a custom confirmation message
// 	const confirmationMessage = 'Are you sure you want to leave?';
// 	(event || window.event).returnValue = confirmationMessage; // Standard for most browsers
// 	return confirmationMessage; // For some older browsers
// });


