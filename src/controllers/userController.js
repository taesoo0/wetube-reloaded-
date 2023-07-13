import { json } from "express";
import Video from "../models/Video";
import User from "../models/User";
import bcrypt from "bcrypt";

export const getjoin = (req, res) => res.render("join", { pageTitle: "Join" });
export const postjoin = async (req, res) => {
  const { name, username, email, password, password2, location } = req.body;
  console.log(password, password2);
  if (password !== password2) {
    return res.status(400).render("join", {
      pageTitle: "Join",
      errorMessage: "password confirmation does not match.",
    });
  }
  const exists = await User.exists({ $or: [{ username }, { email }] });
  if (exists) {
    return res.status(400).render("join", {
      pageTitle: "Join",
      errorMessage: "This username/email is already taken.",
    });
  }
  try {
    await User.create({
      name,
      username,
      email,
      password,
      location,
    });
    return res.redirect("/login");
  } catch (error) {
    return res
      .status(400)
      .render("join", { pageTitle: Join, errorMessage: error._message });
  }
};
export const getLogin = (req, res) =>
  res.render("login", { pageTitle: "Login" });

export const postLogin = async (req, res) => {
  const { username, password } = req.body;
  const pageTitle = "Login";
  const user = await User.findOne({ username, socialOnly: false });
  if (!user) {
    return res.status(400).render("login", {
      pageTitle: pageTitle,
      errorMessage: " AN account with this username dose not exist",
    });
  }
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res.status(400).render("login", {
      pageTitle: pageTitle,
      errorMessage: "Wrong password",
    });
  }
  req.session.loggedIn = true;
  req.session.user = user;
  return res.redirect("/");
};

export const startGithubLogin = (req, res) => {
  const baseUrl = "https://github.com/login/oauth/authorize";
  const config = {
    client_id: process.env.GH_CLIENT,
    allow_signup: false,
    scope: "read:user user:email",
  };
  const params = new URLSearchParams(config).toString();
  console.log(params);
  const finalUrl = `${baseUrl}?${params}`;
  return res.redirect(finalUrl);
};

export const finishGithubLogin = async (req, res) => {
  const baseUrl = "https://github.com/login/oauth/access_token";
  const config = {
    client_id: process.env.GH_CLIENT,
    client_secret: process.env.GH_SECRET,
    code: req.query.code,
  };
  // 이부분에 대한 공부가 더 필요한듯, 사용자의 해당 인증을 허가받고 코드를 받으면, 코드와 나의 클라이언트 코드와 시크릿 코드를 더해서
  // access_token URL로 POST 방식으로 던져주면 해당 유저에대한 값을 리턴받는 형식. 그럼 어떤 데이터를 받을 수 있는지 어떻게 알 수 있지
  // 앞에 권한페이지 설정부분에서 scope로 지정해 주는것인가?
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  //ES6 문법이 아닌 다른 방식의 접근 방법 then 사용

  // fetch(finalUrl, {
  //   method: "POST",
  //   headers: {
  //     Accept: "application/json",
  //   },
  // })
  //   .then((response) => response.json())
  //   .then((json) => {
  //     if ("access_token" in tokenRequest) {
  //       const { access_token } = tokenRequest;
  //       const apiUrl = "https://api.github.com";
  //       const userData = fetch(
  //         fetch(`${apiUrl}/user`, {
  //           headers: {
  //             Authorization: `token ${access_token}`,
  //           },
  //         })
  //           .then((response) => response.json())
  //           .then((json) => {
  //             fetch(`${apiUrl}/uesr/emails`, {
  //               headers: {
  //                 Authorization: `token ${access_token}`,
  //               },
  //             });
  //           })
  //       );
  //     }
  //   });

  // 해당 토큰리퀘스트를 fetch사용해서 전달해주었을때 , 값을 json 형식으로 변환하는 이유?
  const tokenRequest = await (
    await fetch(finalUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
  ).json();
  if ("access_token" in tokenRequest) {
    const { access_token } = tokenRequest;
    const apiUrl = "https://api.github.com";
    // 내가준 코드,클라이언트id,클라이언트secret이 모두 일치하면 리턴값중에 access_token이 포함되어져 있을 것이고, 그때 밑의 패치를 왜 실행시키지?
    // >> Access_token을 가지고 유저의 정보를 받아오는 작업
    const userData = await (
      await fetch(`${apiUrl}/user`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    console.log(userData);
    const emailData = await (
      await fetch(`${apiUrl}/user/emails`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    const emailObj = emailData.find(
      (email) => email.primary === true && email.verified === true
    );
    if (!emailObj) {
      return res.redirect("/login");
    }
    let user = await User.findOne({ email: emailObj.email });
    if (!user) {
      user = await User.create({
        avatarUrl: userData.avatar_url,
        name: userData.name,
        username: userData.login,
        email: emailObj.email,
        password: "",
        socialOnly: true,
        location: userData.location,
      });
    }
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
  } else {
    return res.redirect("/login");
  }
};
export const getEdit = (req, res) => {
  return res.render("edit-profile", { pageTitle: "Edit Profile" });
};
export const postEdit = async (req, res) => {
  const {
    session: {
      user: { _id, avatarUrl },
    },
    body: { name, username, email, location },
    file,
  } = req;
  // 위의 아이디 정의는 아래와 똑같다
  // const id = req.session.user.id
  // const { name, username, email, location } = req.body;

  // updata 항목만들어서 관리하기
  const updateUser = await User.findByIdAndUpdate(
    _id,
    {
      avatarUrl: file ? file.path : avatarUrl,
      name,
      username,
      email,
      location,
    },
    { new: true }
  );
  req.session.user = updateUser;
  // 구조분해 할당으로 해방 객체 update 해주기. ...스프레드 사용
  // req.session.user = {
  //   ...req.session.user,
  //   name,
  //   username,
  //   email,
  //   location,
  // };
  return res.redirect("/users/edit");
};
export const logout = (req, res) => {
  req.session.destroy();
  return res.redirect("/");
};

export const getChangePassword = (req, res) => {
  return res.render("users/change-password", { pageTitle: "Change Password" });
};

export const postCHangePassword = async (req, res) => {
  const {
    session: {
      user: { _id, password },
    },
    body: { oldPassword, newPassword, newPasswordConfirm },
  } = req;
  const ok = await bcrypt.compare(oldPassword, password);
  if (!ok) {
    return res.render("users/change-password", {
      pageTitle: "Change Password",
      errorMessage: "The current password is incorrect",
    });
  }
  if (newPassword !== newPasswordConfirm) {
    return res.status(400).render("users/change-password", {
      pageTitle: "Change Password",
      errorMessage: "The password does not match the confirmation",
    });
  }
  const user = await User.findById(_id);
  user.password = newPassword;
  await user.save();
  req.session.user.password = user.password;
  return res.redirect("/users/logout");
};
export const see = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id).populate("videos");
  console.log(user);
  if (!user) {
    return res.status(404).render("404", { pageTitle: "User not found" });
  }
  return res.render("users/profile", { pageTitle: user.name, user });
};
