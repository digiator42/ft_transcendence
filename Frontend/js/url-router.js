const urlPageTitle = "Pong Os";
import {
  loadGameMenu,
  loadGameCanvas,
  loadToast,
  loadModal,
  showModal,
  hideModal,
  loadSpinner,
  getCookie,
} from "./loadComponent.js";
import { loadTournament, stopTournamentExecution } from "./tournament.js";
import {
  loadTicTac,
  closeTicTac1v1Socket,
  stopTicTacExecution,
} from "./tic_tac.js";
import { loadGame, stopPongExecution, closePong1v1Socket } from "./pong.js";

import { elementIdEditInnerHTML, checkName } from "./utility.js";

const urlRoutes = {
  404: {
    title: "404 | " + urlPageTitle,
    description: "Page not found",
  },
  "/": {
    title: "login | " + urlPageTitle,
    description: "Pongos login page",
  },
  "/desktop": {
    title: "Desktop | " + urlPageTitle,
    description: "Pongos desktop page",
  },
  "/profile": {
    title: "Profile | " + urlPageTitle,
    description: "Pongos myprofile page",
  },
  "/play": {
    title: "Play | " + urlPageTitle,
    description: "Pongos play page",
  },
  "/users": {
    title: "Users | " + urlPageTitle,
    description: "Pongos users page",
  },
};

const gameRoutes = {
  "/games_pong_local": {
    title: "local pong | " + urlPageTitle,
    description: "Pongos local page",
  },
  "/games_pong_online": {
    title: "online pong | " + urlPageTitle,
    description: "Pongos online page",
  },
  "/games_pong_local_tournament": {
    title: "local tournaments pong | " + urlPageTitle,
    description: "Pongos local tournament page",
  },
  "/games_pong_online_tournament": {
    title: "online tournaments pong | " + urlPageTitle,
    description: "Pongos online tournaments page",
  },
  "/games_tictactoe_local": {
    title: "tic tac toe | " + urlPageTitle,
    description: "Pongos tic tac toe page",
  },
  "/games_tictactoe_online": {
    title: "tic tac toe | " + urlPageTitle,
    description: "Pongos tic tac toe page",
  },
};

let userToken;
let user;
let LOGIN_PAGE_HTML = "";
let gameMode = "none";

await fetch("/components/login.html")
  .then((response) => response.text())
  .then((data) => {
    LOGIN_PAGE_HTML = data;
  });

function checkAuth() {
  fetch("api/check_auth/", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
  }).then((response) => {
    if (!response.ok) {
      loadLoginPage("Unauthorized, please login again!");
    }
  });
}

async function loadLoginPage(message) {
  document.getElementById("main-content").innerHTML = LOGIN_PAGE_HTML;
  if (message) {
    loadToast(message);
  }
  localStorage.clear();
  await fetch("/api/logout/", {
    credentials: "include",
  }).then((response) => {
    if (!response.ok) {
      return null;
    }
    if (response.status === 204) {
      localStorage.clear();
      loadLoginPage();
    }
    return null;
  });
  const docModalAll = document.querySelectorAll(".modal");
  const tmpModalBs = "";
  if (docModalAll) {
    docModalAll.forEach((element) => {
      tmpModalBs = bootstrap.Modal.getOrCreateInstance(element);
      tmpModalBs.hide();
    });
  }
}

await fetch(`/api/get_user_data/`, {
  method: "GET",
})
  .then((response) => {
    if (response.status === 204) {
      localStorage.clear();
      return null;
    } else if (!response.ok) {
      return null;
    }
    return response.json();
  })
  .then((data) => {
    if (!data) {
      return false;
    }
    user = data.user_data;
    if (user) {
      sessionStorage.setItem("user", JSON.stringify(user));
    }
  });

const viewUserProfile = (username) => {
  const url = `/api/users/${username}?username=${user.username}}`;
  fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
  })
    .then((response) => response.text())
    .then((data) => {
      elementIdEditInnerHTML("windowScreen", data);
      const addFriendButton = document.getElementById("add-friend");
      addFriendButton?.addEventListener("click", async () => {
        addFriend(addFriendButton, user.username, username);
      });
    })
    .catch((error) => {
      console.error("Error:", error);
    });
};

const addFriend = async (button, username, newFriend) => {
  try {
    const response = await fetch(
      `/api/toggle_friend/?user1=${username}&user2=${newFriend}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "x-csrftoken": getCookie("csrftoken"),
        },
      }
    );

    if (!response.ok) {
      elementIdEditInnerHTML("main-content", LOGIN_PAGE_HTML);
      loadToast("Unauthorized, please login again!");
      localStorage.clear();
      return;
    }

    const data = await response.text();
    if (data === "Added") {
      button.innerHTML = "Remove Friend";
      loadToast("Friend Added successfully :(");
    } else {
      button.innerHTML = "Add Friend";
      loadToast("Friend Removed succesfully :)");
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

let navbarLinks = document.querySelectorAll("#navbar a");

navbarLinks?.forEach(function (link) {
  link.addEventListener("click", function (event) {
    event.preventDefault();
    window.history.pushState({}, "", link);
    urlLocationHandler();
  });
});

function setMainWindowframe() {
  insertOrCreateContent();
  elementIdEditInnerHTML(
    "content",
    `
				<div class="container p-0 m-0 border border-0 border-light" id="closeWindow">
					<div class="p-0 rounded-1 d-flex flex-column overflow-hidden shadow-lg border border-0 border-light">
						<!-- WINDOW-BAR -->
						<div class="d-flex p-0 border border-0 border-light bg-black">
							<button type="button" class="d-flex m-2 border border-0 border-light bg-transparent" id="close-me" aria-label="Close">
								<svg xmlns="https://www.w3.org/2000/svg" width="20" height="20"
									viewBox="0 0 20 20" fill="none">
									<path
										d="M2.21736 20H4.44931V17.7697H6.66667V15.5539H8.88403V13.3382H11.116V15.5539H13.3333V17.7697H15.5653V20H17.7826V17.7697H20V15.5539H17.7826V13.3382H15.5653V11.1079H13.3333V8.89213H15.5653V6.67639H17.7826V4.44606H20V2.23032H17.7826V0H15.5653V2.23032H13.3333V4.44606H11.116V6.67639H8.88403V4.44606H6.66667V2.23032H4.44931V0H2.21736V2.23032H0V4.44606H2.21736V6.67639H4.44931V8.89213H6.66667V11.1079H4.44931V13.3382H2.21736V15.5539H0V17.7697H2.21736V20Z"
										fill="#E1E0DF" />
								</svg>
							</button>
							<div class="container-fluid my-1 me-1 border border-0 border-light bg--polka">
							</div>
						</div>
						<!-- WINDOW-SCREEN -->
						<div class="ratio ratio-4x3">
							<div class="d-flex h-100 w-100 flex-grow-1 border border-0 border-light bg-light window" id="windowScreen">
							</div>
						</div>
					</div>
				</div>
			`
  );
  document.getElementById("close-me")?.addEventListener("click", () => {
    if (gameMode !== "none") {
      closePong1v1Socket();
      closeTicTac1v1Socket();
      const canvasElement = document.getElementById("gameCanvas");
      if (canvasElement) {
        let animationId = canvasElement.dataset.animationFrameId;
        window.cancelAnimationFrame(animationId);
        canvasElement.remove();
        if (gameMode === "pong single") stopPongExecution();
        if (gameMode === "pong tournament") stopTournamentExecution();
        gameMode = "none";
      }
      const tictacContainer = document.getElementById("tictac-container");
      if (tictacContainer) {
        tictacContainer.remove();
        if (gameMode === "tic tac single") stopTicTacExecution();
        gameMode = "none";
      }
    }
    elementIdEditInnerHTML("closeWindow", "");
  });
}

async function updateProfile(file) {
  const maxSizeInBytes = 5 * 1024 * 1024; // 5 MB

  if (file.size > maxSizeInBytes) {
    loadToast("File size is too large, Please choose a smaller file.");
    return;
  }

  let formData = new FormData();
  formData.append("image", file);
  formData.append("username", user.username);
  await fetch("/api/update_user_profile/", {
    method: "POST",
    body: formData,
    headers: {
      "X-CSRFToken": getCookie("csrftoken"),
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
    credentials: "include",
  })
    .then((response) => {
      if (!response.ok) {
        elementIdEditInnerHTML("main-content", LOGIN_PAGE_HTML);
        loadToast(
          "Failed to update Image, You have to login again for security reasons!"
        );
        localStorage.clear();
        hideModal("modalSetting");

        return null;
      }
      return response.json();
    })
    .then((data) => {
      if (!data) {
        return;
      }
      loadToast("Image updated successfully");
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

let loadModalFile = async function (event) {
  let image = document.getElementById("output");

  document
    .getElementById("inputFile-btn")
    ?.addEventListener("click", async () => {
      let modalInput = document.getElementById("modal-inputFile");
      if (modalInput) {
        let modalFile = modalInput.files[0];

        updateProfile(modalFile, image);
        if (image) image.src = URL.createObjectURL(event.target.files[0]);
      }
    });
};

document
  .getElementById("modalSettingBtn")
  ?.addEventListener("click", async () => {
    loadModal(
      "modalSettingBody",
      `
			<div class="d-flex flex-column align-items-center rounded p-5 border border-1 border-black w-100 h-100 font--argent gap-5">
				<div class="input-group w-50">
					<input type="file" class="form-control border border-1 border-black" accept="image/*" id="modal-inputFile"
						aria-describedby="inputFile" aria-label="Upload">
					<button class="btn btn-dark text-capitalize w-25" type="button" id="inputFile-btn">upload</button>
				</div>
				<div class="input-group w-50">
					<span class="input-group-text border border-1 border-dark bg-dark text-white">
						<svg xmlns="http://www.w3.org/2000/svg" width="30px" viewBox="0 0 32 32"><title>interface-essential-text-input-area-3</title><g><path d="M30.48 15.995H32v4.58h-1.52Z" fill="#ffffff" stroke-width="1"></path><path d="M30.48 11.425H32v3.05h-1.52Z" fill="#ffffff" stroke-width="1"></path><path d="M28.95 20.575h1.53v1.52h-1.53Z" fill="#ffffff" stroke-width="1"></path><path d="M28.95 9.905h1.53v1.52h-1.53Z" fill="#ffffff" stroke-width="1"></path><path d="M27.43 22.095h1.52v1.52h-1.52Z" fill="#ffffff" stroke-width="1"></path><path d="M27.43 8.385h1.52v1.52h-1.52Z" fill="#ffffff" stroke-width="1"></path><path d="M25.91 5.335h3.04v1.52h-3.04Z" fill="#ffffff" stroke-width="1"></path><path d="M25.91 25.145h3.04v1.52h-3.04Z" fill="#ffffff" stroke-width="1"></path><path d="M24.38 6.855h1.53v18.29h-1.53Z" fill="#ffffff" stroke-width="1"></path><path d="M21.34 5.335h3.04v1.52h-3.04Z" fill="#ffffff" stroke-width="1"></path><path d="M21.34 25.145h3.04v1.52h-3.04Z" fill="#ffffff" stroke-width="1"></path><path d="M18.29 22.095h4.57v1.52h-4.57Z" fill="#ffffff" stroke-width="1"></path><path d="M21.34 19.045h1.52v1.53h-1.52Z" fill="#ffffff" stroke-width="1"></path><path d="M21.34 14.475h1.52v1.52h-1.52Z" fill="#ffffff" stroke-width="1"></path><path d="M19.81 15.995h1.53v3.05h-1.53Z" fill="#ffffff" stroke-width="1"></path><path d="M18.29 8.385h4.57v1.52h-4.57Z" fill="#ffffff" stroke-width="1"></path><path d="M16.76 15.995h1.53v3.05h-1.53Z" fill="#ffffff" stroke-width="1"></path><path d="M12.19 22.095h4.57v1.52h-4.57Z" fill="#ffffff" stroke-width="1"></path><path d="m13.72 15.995 3.04 0 0 -1.52 -3.04 0 0 -3.05 -1.53 0 0 9.15 4.57 0 0 -1.53 -3.04 0 0 -3.05z" fill="#ffffff" stroke-width="1"></path><path d="M12.19 8.385h4.57v1.52h-4.57Z" fill="#ffffff" stroke-width="1"></path><path d="m10.67 12.955 -1.52 0 0 3.04 -3.05 0 0 -3.04 -1.53 0 0 7.62 1.53 0 0 -3.05 3.05 0 0 3.05 1.52 0 0 -7.62z" fill="#ffffff" stroke-width="1"></path><path d="M6.1 22.095h4.57v1.52H6.1Z" fill="#ffffff" stroke-width="1"></path><path d="M6.1 11.425h3.05v1.53H6.1Z" fill="#ffffff" stroke-width="1"></path><path d="M6.1 8.385h4.57v1.52H6.1Z" fill="#ffffff" stroke-width="1"></path><path d="M3.05 22.095h1.52v1.52H3.05Z" fill="#ffffff" stroke-width="1"></path><path d="M3.05 8.385h1.52v1.52H3.05Z" fill="#ffffff" stroke-width="1"></path><path d="M1.53 20.575h1.52v1.52H1.53Z" fill="#ffffff" stroke-width="1"></path><path d="M1.53 9.905h1.52v1.52H1.53Z" fill="#ffffff" stroke-width="1"></path><path d="M0 15.995h1.53v4.58H0Z" fill="#ffffff" stroke-width="1"></path><path d="M0 11.425h1.53v3.05H0Z" fill="#ffffff" stroke-width="1"></path></g></svg>
					</span>
					<div class="form-floating">
						<input type="text" class="form-control border border-1 border-dark" id="displayNameInput"
							placeholder="Username">
						<label for="displayNameInput" class="text-capitalize">display name</label>
					</div>
					<button id="nickname-btn" type="button" class="btn btn-dark w-25">
						<p class="h5 p-0 m-0 text-capitalize">save</p>
					</button>
				</div>
				<button id="logout" class="btn btn-dark px-5">
					<p class="display-5 text-capitalize p-0">
						logout
					</p>
				</button>
			</div>
		`
    );

    document
      .getElementById("modal-inputFile")
      ?.addEventListener("change", loadModalFile, false);
    document.getElementById("logout")?.addEventListener("click", () => {
      localStorage.clear();
      fetch("/api/logout", {
        credentials: "include",
      })
        .then((response) => {
          if (!response.ok) {
            loadLoginPage("Please login to continue");
            return null;
          }
          if (response.status === 204) {
            localStorage.clear();
            loadLoginPage();
            return null;
          }
          return response.json();
        })
        .then(async (data) => {
          if (!data) return;
          if (data.message === "Logged out successfully") {
            elementIdEditInnerHTML("main-content", LOGIN_PAGE_HTML);
            loadToast("You have been logged out successfully ;(");
          }
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
      hideModal("modalSetting");
    });
    document
      .getElementById("nickname-btn")
      ?.addEventListener("click", async () => {
        const newDisplayName = document.getElementById("displayNameInput");
        const nicknameValue = newDisplayName.value;
        const displayNameElement = document.getElementById("displayName");

        if (!checkName(nicknameValue)) return;

        await fetch("/api/update_display_name/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken"),
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          credentials: "include",
          body: JSON.stringify({ display_name: nicknameValue }),
        })
          .then((response) => {
            if (!response.ok) {
              elementIdEditInnerHTML("main-content", LOGIN_PAGE_HTML);
              loadToast(
                "Failed to update display name, You have to login again for security reasons!"
              );
              hideModal("modalSetting");
              return null;
            }
            return response.json();
          })
          .then((data) => {
            if (!data) {
              return;
            }
            if (displayNameElement) {
              displayNameElement.textContent = nicknameValue;
            }
            loadToast("Display name updated successfully");
          });
      });
  });

export const urlLocationHandler = async () => {
  if (!user) {
    elementIdEditInnerHTML("main-content", LOGIN_PAGE_HTML);
    return;
  }

  if (gameMode !== "none") {
    const canvasElement = document.getElementById("gameCanvas");
    if (canvasElement) {
      closePong1v1Socket();
      let animationId = canvasElement.dataset.animationFrameId;
      window.cancelAnimationFrame(animationId);
      canvasElement.remove();
      if (gameMode === "pong single") stopPongExecution();
      if (gameMode === "pong tournament") stopTournamentExecution();
      gameMode = "none";
    }
    //tic
    const tictacContainer = document.getElementById("tictac-container");
    if (tictacContainer) {
      closeTicTac1v1Socket();
      tictacContainer.remove();
      if (gameMode === "tic tac single") stopTicTacExecution();
      gameMode = "none";
    }
  }

  insertOrCreateContent();
  elementIdEditInnerHTML("content", "");
  let location = window.location.pathname;
  if (location[location.length - 1] === "/") {
    location = location.slice(0, location.length - 1);
  }
  if (location.length == 0) {
    location = "/";
  }
  if (location === "/" && localStorage.getItem("access_token")) {
    location = "/desktop";
  }
  if (!localStorage.getItem("access_token")) {
    location = "/";
  }
  const route = urlRoutes[location] || urlRoutes["404"];

  if (location === "/") {
    document.getElementById("navbar")?.remove();
    elementIdEditInnerHTML("main-content", LOGIN_PAGE_HTML);
    return;
  }

  document.getElementById("navbar").style.display = "flex";
  elementIdEditInnerHTML("username-welcome", `${user ? user.username : ""}`);

  if (gameRoutes.hasOwnProperty(location)) {
    checkAuth();
    const gameRoute = gameRoutes[location];
    setMainWindowframe();
    loadGameCanvas();
    switch (location) {
      case "/games_pong_local":
        gameMode = "pong single";
        loadGame(localStorage.getItem("username"), true);
        break;
      case "/games_pong_online":
        gameMode = "pong single";
        loadGame(localStorage.getItem("username"), false);
        break;
      case "/games_tictactoe_local":
        gameMode = "tic tac single";
        loadTicTac(localStorage.getItem("username"), true);
        break;
      case "/games_tictactoe_online":
        gameMode = "tic tac single";
        loadTicTac(localStorage.getItem("username"), false);
        break;
      case "/games_pong_local_tournament":
        gameMode = "pong tournament";
        loadTournament(localStorage.getItem("username"), true);
        break;
      case "/games_pong_online_tournament":
        gameMode = "pong tournament";
        loadTournament(localStorage.getItem("username"), false);
        break;
      default:
        break;
    }
    document.title = gameRoute.title;
    return;
  } else if (location === "/play") {
    checkAuth();
    setMainWindowframe();
    loadGameMenu();
    let gameMenu = document.querySelectorAll("#gameMenu a");

    gameMenu?.forEach(function (link) {
      link.addEventListener("click", function (event) {
        event.preventDefault();
        window.history.pushState({}, "", link);
        urlLocationHandler();
      });
    });
    loadToast(
      "Pong: use 'w' & 's' for player 1 | use '↑' & '↓' for player 2" +
        "\n" +
        "Tic Tac Toe: use clicks to play"
    );
    document.title = route.title;
    return;
  } else if (location === "/desktop") {
    loadToast(`Welcome ${user.username}!`);
  } else if (location === "/profile") {
    setMainWindowframe();
    if (!user) {
      elementIdEditInnerHTML("main-content", LOGIN_PAGE_HTML);
      localStorage.clear();
      return;
    }
    await fetch(`/api/users/${user.username}?username=${user.username}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          elementIdEditInnerHTML("main-content", LOGIN_PAGE_HTML);
          localStorage.clear();
          loadToast("Please login to continue");
          return null;
        }
        return response.text();
      })
      .then((data) => {
        if (!data) {
          return;
        }
        elementIdEditInnerHTML("windowScreen", data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });

    document
      .getElementById("2fa-button")
      ?.addEventListener("click", async () => {
        try {
          const response = await fetch(
            `api/enable_or_disable_2fa/?username=${user.username}`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                "x-csrftoken": getCookie("csrftoken"),
              },
            }
          );

          if (!response.ok) {
            elementIdEditInnerHTML("main-content", LOGIN_PAGE_HTML);
            loadToast("Please login to to verify your identity");
            localStorage.clear();
            throw new Error(
              response.statusText === "Unauthorized"
                ? "Unauthorized"
                : "Network response was not ok"
            );
          }

          const data = await response.text();

          if (data === "2FA disabled successfully") {
            elementIdEditInnerHTML("2fa-button", "Enable 2FA");

            loadToast("2FA disabled successfully");
          } else {
            document.getElementById("navbar").style.display = "none";
            elementIdEditInnerHTML("main-content", LOGIN_PAGE_HTML);
            localStorage.clear();
            loadToast("2FA enabled successfully, please login again");
          }
        } catch (error) {
          console.error("Error:", error);
        }
      });
  } else if (location === "/users") {
    setMainWindowframe();
    await fetch("/components/player-card.html")
      .then((response) => response.text())
      .then((data) => {
        elementIdEditInnerHTML("windowScreen", data);
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
      insertAllUsers(
        users.filter((user) =>
          user.username.startsWith(inputValue.toLowerCase())
        )
      );
    });
  } else {
    await fetch("/components/404.html")
      .then((response) => response.text())
      .then((data) => {
        elementIdEditInnerHTML("main-content", data);
      });
  }

  document.title = route.title;
};

handleUserData();

async function handleUserData() {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get("code");
  const url = new URL(window.location.href);
  url.search = "";
  const mainUrl = url.toString();

  history.replaceState({}, "", mainUrl);

  if (code) {
    loadSpinner("content", "text-white");
    if (document.getElementById("navbar")) {
      document.getElementById("navbar").style.display = "none";
    }
    await fetch(`/api/auth/?code=${code}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          if (response.status === 400) {
            elementIdEditInnerHTML("main-content", LOGIN_PAGE_HTML);
            loadToast("Invalid code");
            localStorage.clear();
            return;
          }
          elementIdEditInnerHTML("main-content", LOGIN_PAGE_HTML);
          loadToast("Please login to continue");
          localStorage.clear();
          return;
        }
        return response.json();
      })
      .then((data) => {
        if (!data) {
          return;
        }
        if (data.message) {
          if (data.message === "hacker") {
            window.location.href = `https://www.google.com/search?q=hello%20mr%20${data.name}%20how%20are%20you%20today`;
          }
          return;
        }
        userToken = data.token;
        user = data.user;
        sessionStorage.setItem("user", JSON.stringify(user));
        const otp = data.otp;
        if (otp === "validate_otp") {
          setMainWindowframe();
          elementIdEditInnerHTML(
            "windowScreen",
            `
							<div class="d-flex flex-column h-100 w-100 mh-100 mw-100 gap-5 justify-content-center align-items-center font--argent" id="otp-container">
								<div class="p-5">
									<label for="otp-input" class="form-label">Your OTP Code is valid for 5 minutes</label>
									<input type="text" class="form-control" id="otp-input" placeholder="Enter OTP code">
								</div>
								<button type="submit-otp" id="submit-otp" class="btn btn-outline-dark border border-2 border-black rounded">Validate OTP</button>
							</div>
						`
          );

          document
            .getElementById("submit-otp")
            .addEventListener("click", async () => {
              let otp = document.getElementById("otp-input").value;
              if (!otp) {
                loadToast("Please enter OTP code");
                return;
              }
              const requestBody = new URLSearchParams();
              requestBody.append("username", data.user.username);
              requestBody.append("otp", otp);

              await fetch("api/validate_otp/", {
                method: "POST",
                headers: {
                  "Content-Type": "application/x-www-form-urlencoded",
                  Authorization: `Bearer ${userToken}`,
                  "x-csrftoken": getCookie("csrftoken"),
                },
                body: requestBody.toString(),
              })
                .then((response) => {
                  if (!response.ok) {
                    elementIdEditInnerHTML("main-content", LOGIN_PAGE_HTML);
                    loadToast("Please login to continue");
                    localStorage.clear();
                    throw new Error(
                      response.statusText === "Unauthorized"
                        ? "Unauthorized"
                        : "Network response was not ok"
                    );
                  }
                  return response.json();
                })
                .then((data) => {
                  // Handle the response data here
                  if (data.message === "OTP is valid") {
                    localStorage.setItem("access_token", userToken);
                    elementIdEditInnerHTML("windowScreen", "");
                    loadToast("OTP is valid, enjoy pongos");
                    window.history.pushState({}, "", "/desktop");

                    window.onpopstate = urlLocationHandler;
                    urlLocationHandler();
                  } else {
                    loadToast("Invalid OTP code");
                    const tryAgainButton =
                      '<button type="" id="try-again-btn" class="btn btn-outline-dark border border-2 border-black rounded">Go back to Login</button>';
                    if (!document.getElementById("try-again-btn")) {
                      document
                        .getElementById("otp-container")
                        .insertAdjacentHTML("beforeend", tryAgainButton);
                    }
                    document
                      .getElementById("try-again-btn")
                      .addEventListener("click", () => {
                        elementIdEditInnerHTML("main-content", LOGIN_PAGE_HTML);
                        localStorage.clear();
                      });
                  }
                })
                .catch((error) => {
                  console.error("Error:", error);
                });
            });
          return;
        }
        let csrfToken = data.csrfToken;
        if (userToken && user) {
          localStorage.setItem("access_token", userToken);
          localStorage.setItem("username", user.username);
        }

        window.history.pushState({}, "", "/desktop");

        window.onpopstate = urlLocationHandler;
        urlLocationHandler();
      });
    return;
  }
  window.onpopstate = urlLocationHandler;
  urlLocationHandler();
}

function insertOrCreateContent() {
  if (!document.getElementById("content")) {
    const content = document.createElement("div");
    content.id = "content";
    document.body.appendChild(content);
  }
}

async function getAllUsers(override) {
  let location = window.location.pathname;
  if (location[location.length - 1] === "/") {
    location = location.slice(0, location.length - 1);
  }
  if (location !== "/users") return;
  let users;
  await fetch("/api/get_all_users/", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        if (!response.ok) {
          localStorage.clear();
          elementIdEditInnerHTML("main-content", LOGIN_PAGE_HTML);
          loadToast("Please login to continue");
          return null;
        }
      }
      return response.json();
    })
    .then((data) => {
      if (!data) {
        return;
      }
      let sameUser = user["username"];
      users = data.filter(
        (item) => item.username !== "admin" && item.username !== sameUser
      );
      return users;
    })
    .catch((error) => {
      console.error("Error:", error);
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
  if (location[location.length - 1] === "/") {
    location = location.slice(0, location.length - 1);
  }
  if (location !== "/users") return;
  let users = [];
  await fetch(`/api/friends/${user.username}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        if (!response.ok) {
          localStorage.clear();
          elementIdEditInnerHTML("main-content", LOGIN_PAGE_HTML);
          loadToast("Please login to continue");
          return null;
        }
      }
      return response.json();
    })
    .then((data) => {
      if (!data) {
        return;
      }
      users = data;
      return users;
    })
    .catch((error) => {
      console.error("Error:", error);
    });
  return users;
}

async function insertAllUsers(users) {
  let playerCardDiv = document.getElementById("player-card-div");

  if (!users || !playerCardDiv) {
    return;
  }
  playerCardDiv.innerHTML = "";
  let friends = await getAllFriends();
  //call getAllFriends here:

  users?.forEach((user) => {
    let isFriend = false;
    isFriend = elementExistsInArray(friends, user.intra);
    const userImage = `https://10.13.5.14:9090/api/get_image/${user.username}`;
    const playerCard = `
								<div class="d-flex flex-row p-0 g-0">
								<div class="col-2 p-0 border border-1 border-dark">
									<div class="ratio ratio-1x1 bg-black mh-100 mw-100">
										<img src="${
                      user.image ? userImage : user.picture.link
                    }" class="object-fit-cover rounded-circle img-fluid p-1" alt="...">
									</div>
								</div>
								<div class="col d-flex flex-column ps-2 justify-content-center text-truncate text-break border border-1 border-dark">
									<p class="font--argent p-0 m-0" style="font-size: 1.5vw;">${user.intra}</p>
									<p class="font--argent p-0 m-0" style="font-size: 0.75vw;">${
                    user.is_online ? "online 🟢" : "offline ⚪"
                  }</p>
									<p class="font--argent text-capitalize p-0 m-0" style="font-size: 0.9vw;">ranking</p>
								</div>
								<div class="col-2 p-0 text-truncate border border-1 border-dark">
									<div class="ratio ratio-1x1">
										<button class="btn bg-primary-subtle rounded-0 font--argent text-capitalize view-profile-btn text-wrap" type="button" style="font-size: 1vw;">view profile</button>
									</div>
								</div>
								<div class="col-2 p-0 text-truncate border border-1 border-dark">
									<div class="ratio ratio-1x1">
										<button class="btn bg-dark-subtle rounded-0 font--argent text-capitalize add-friend-btn text-wrap" type="button" style="font-size: 1vw;">
											${isFriend ? "remove friend" : "add friend"}
										</button>
									</div>
								</div>
								</div>`;
    playerCardDiv.innerHTML += playerCard;
  });
  const buttons = document.getElementsByClassName("view-profile-btn");
  for (let i = 0; i < buttons.length; i++) {
    const button = buttons[i];
    button.addEventListener("click", function () {
      viewUserProfile(users[i].username);
    });
  }
  const addFriendButtons = document.getElementsByClassName("add-friend-btn");
  for (let i = 0; i < addFriendButtons.length; i++) {
    const button = addFriendButtons[i];
    button.addEventListener("click", function () {
      addFriend(button, user.username, users[i].username);
    });
  }
}
