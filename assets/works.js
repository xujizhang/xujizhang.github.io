/* Site data. The top navigation of every page and the research list (research/) are built from this file,
   so a new paper is added here once and appears everywhere.
   home:    personal homepage URL; while empty, the house icon stays hidden on every page.
   me:      name to highlight in author lists.
   papers:  first-author papers, newest first, shown with their teaser figure (thumb).
   collabs: co-authored papers, newest first, listed in citation style without figures.
   Each entry: title, authors, venue (full name; may be empty), venueShort (standard abbreviation, shown in bold),
   volume (optional), year, and optional links arxiv / page / code
   (page = project page path relative to the site root). Missing links are simply not shown. */
window.SITE = {
  home: '',
  me: 'Xuji Zhang',
  papers: [
    {
      id: 'recallflow',
      short: 'RecallFlow',
      title: 'RecallFlow: Episodic Memory as the Source Distribution of Generative Robot Policies',
      authors: ['Xuji Zhang', 'Qilin Zhong', 'Zichen Zhang', 'Wei Zhai', 'Jian Di', 'Kun Li', 'Yang Cao', 'Wenjun Lv'],
      venue: 'arXiv preprint',
      year: 2026,
      arxiv: 'https://arxiv.org/abs/2611.23731',
      page: 'RecallFlow/',
      thumb: 'RecallFlow/media/thumb.png'
    },
    {
      id: 'repselect',
      title: 'Which Representation Fits the Task? Adaptive Selection for Robot Learning from Human Videos',
      authors: ['Xuji Zhang', 'Zichen Zhang', 'Wei Zhai', 'Jian Di', 'Kun Li', 'Yang Cao', 'Wenjun Lv'],
      venue: '',
      year: 2026,
      thumb: 'research/media/repselect.png'
    }
  ],
  collabs: [
    {
      short: 'ART',
      title: 'ART: Bridging the Embodiment Gap in 3D Human-to-Robot Affordance Transfer',
      authors: ['Zichen Zhang', 'Wei Zhai', 'Xuji Zhang', 'Yang Cao', 'Yu Kang'],
      venue: 'IEEE Transactions on Artificial Intelligence',
      venueShort: 'TAI',
      year: 2026,
      arxiv: 'https://arxiv.org/abs/2611.24182',
      page: 'https://derek0907.github.io/ART/'
    },
    {
      title: 'CRAFT: Learning Object-Centric Motion Abstractions for Human-to-Robot Skill Transfer',
      authors: ['Zichen Zhang', 'Xuji Zhang', 'Wei Zhai', 'Jian Di', 'Kun Li', 'Yang Cao', 'Wenjun Lv'],
      venue: '',
      year: 2026
    },
    {
      title: 'SHIFT: Learning Skill Fields from Human Videos for Robot Manipulation',
      authors: ['Zichen Zhang', 'Xuji Zhang', 'Wei Zhai', 'Jian Di', 'Kun Li', 'Yang Cao', 'Wenjun Lv'],
      venue: '',
      year: 2026
    },
    {
      title: 'Guiding Multiple Remote Users in Physical Tasks with Language-driven Robotic Telepresence',
      authors: ['Ruyi Li', 'Jingfei Guo', 'Xinyi Zhang', 'Xuji Zhang', 'Zeqing Li', 'Jiannan Li', 'Jiangtao Gong'],
      venue: 'Proceedings of the ACM on Interactive, Mobile, Wearable and Ubiquitous Technologies',
      venueShort: 'IMWUT',
      volume: '9(3)',
      year: 2025
    }
  ]
};
