export const buildYoutubeLinks = (ideaTitle, materials) => {
  const query = encodeURIComponent(`${ideaTitle} DIY craft using ${materials.join(" ")}`);

  return [
    {
      title: `YouTube tutorials for ${ideaTitle}`,
      url: `https://www.youtube.com/results?search_query=${query}`
    }
  ];
};
