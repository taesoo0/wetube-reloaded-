let videos = [
  {
    title: "Fitst video",
    rating: 5,
    comments: 2,
    createdAt: "2 minutes ago",
    videws: 59,
    id: 1,
  },
  {
    title: "Second video",
    rating: 5,
    comments: 2,
    createdAt: "2 minutes ago",
    videws: 59,
    id: 2,
  },
  {
    title: "Third video",
    rating: 5,
    comments: 2,
    createdAt: "2 minutes ago",
    videws: 59,
    id: 3,
  },
];

export const trending = (req, res) => {
  return res.render("home", { pageTitle: "Home", videos });
};
export const see = (req, res) => {
  const { id } = req.params;
  const video = videos[id - 1];
  res.render("watch", { pageTitle: "Watch", video });
};
export const edit = (req, res) => res.render("edit");
export const search = (req, res) => res.send("search");
export const upload = (req, res) => res.send("Upload");

export const deleteVideo = (req, res) => {
  console.log(req.params);
  res.send("Video Delete");
};
