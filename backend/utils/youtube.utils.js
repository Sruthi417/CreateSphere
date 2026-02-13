export const buildYoutubeLinks = (ideaTitle, materials) => {
  const query = encodeURIComponent(`${ideaTitle} DIY craft using ${materials.join(" ")}`);

  return [
    {
      title: `Watch tutorials for ${ideaTitle}`,
      url: `https://www.youtube.com/results?search_query=${query}`
    },
    {
      title: `More crafts with ${materials.slice(0, 2).join(" & ")}`,
      url: `https://www.youtube.com/results?search_query=DIY+crafts+using+${encodeURIComponent(materials.join(" "))}`
    }
  ];
};
