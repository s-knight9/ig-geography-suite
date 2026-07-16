export const studentNames: Record<string, string> = {
  "syahn27@pupils.nlcsjeju.kr": "Soyeon Ahn",
  "ylahn27@pupils.nlcsjeju.kr": "Zoe Ahn",
  "bjbaek27@pupils.nlcsjeju.kr": "Thomas Baek",
  "yocho27@pupils.nlcsjeju.kr": "Yuon Cho",
  "mschoi27@pupils.nlcsjeju.kr": "Antony Choi",
  "jeun27@pupils.nlcsjeju.kr": "Jiho Eun",
  "jhan27@pupils.nlcsjeju.kr": "Jihyo Han",
  "sjhong27@pupils.nlcsjeju.kr": "Julia Hong",
  "shhuh27@pupils.nlcsjeju.kr": "Sabrina Huh",
  "hjim27@pupils.nlcsjeju.kr": "Philip Im",
  "wjjang27@pupils.nlcsjeju.kr": "Woojin Jang",
  "jkang27@pupils.nlcsjeju.kr": "Erin Kang",
  "ckim27@pupils.nlcsjeju.kr": "Daniel Kim",
  "dbkim27@pupils.nlcsjeju.kr": "Oscar Kim",
  "dkim27@pupils.nlcsjeju.kr": "Juliet Kim",
  "hjkim27@pupils.nlcsjeju.kr": "Daniel Kim",
  "jmkim27@pupils.nlcsjeju.kr": "Grace Kim",
  "nekim27@pupils.nlcsjeju.kr": "Emily Kim",
  "nkim27@pupils.nlcsjeju.kr": "Chloe Kim",
  "sh2kim27@pupils.nlcsjeju.kr": "Peter Kim",
  "sykim27@pupils.nlcsjeju.kr": "Soyul Kim",
  "y3kim27@pupils.nlcsjeju.kr": "Yujoo Kim",
  "yskim27@pupils.nlcsjeju.kr": "Yunseo Kim",
  "ykim27@pupils.nlcsjeju.kr": "Leo Kim",
  "hoanlee27@pupils.nlcsjeju.kr": "Steve Lee",
  "jylee27@pupils.nlcsjeju.kr": "Joshua Lee",
  "slee27@pupils.nlcsjeju.kr": "Sam Lee",
  "shlee27@pupils.nlcsjeju.kr": "Andy Lee",
  "yr3lee27@pupils.nlcsjeju.kr": "Chloe Lee",
  "cpark27@pupils.nlcsjeju.kr": "Aiden Park",
  "kwpark27@pupils.nlcsjeju.kr": "Chloe Park",
  "jaehpark27@pupils.nlcsjeju.kr": "Noah Park",
  "jh2park27@pupils.nlcsjeju.kr": "Madison Park",
  "js2park27@pupils.nlcsjeju.kr": "Jungseo Park",
  "seshin27@pupils.nlcsjeju.kr": "Teddy Shin",
  "hgyoon27@pupils.nlcsjeju.kr": "Hugo Yoon",
  "swyoon27@pupils.nlcsjeju.kr": "Sharon Yoon",
  "sayoon27@pupils.nlcsjeju.kr": "Sola Yoon",
  "dylim27@pupils.nlcsjeju.kr": "Dahye Lim",
  
  // Class of 28 fallbacks
  "tekim28@pupils.nlcsjeju.kr": "Tae Kim",
  "dkkwon28@pupils.nlcsjeju.kr": "Dong Kwon",
  "jhlim28@pupils.nlcsjeju.kr": "Ji Lim",
  "shpark28@pupils.nlcsjeju.kr": "Sung Park",
  "myju28@pupils.nlcsjeju.kr": "Min Ju",
  "yjahn28@pupils.nlcsjeju.kr": "Ye Ahn",
  "mspark28@pupils.nlcsjeju.kr": "Min Park",
  "crkim28@pupils.nlcsjeju.kr": "Chan Kim",
  "jyseol28@pupils.nlcsjeju.kr": "Ji Seol",
  "ptli28@pupils.nlcsjeju.kr": "Peter Li",
  "jeun28@pupils.nlcsjeju.kr": "Ji Eun",
  "syang28@pupils.nlcsjeju.kr": "Soo Yang",
  "jcho28@pupils.nlcsjeju.kr": "Ji Cho",
  "hslee28@pupils.nlcsjeju.kr": "Ho Lee",
  "ygshim28@pupils.nlcsjeju.kr": "Ye Shim",
  "jekim28@pupils.nlcsjeju.kr": "Ji Kim",
  "sy2lee28@pupils.nlcsjeju.kr": "Soo Lee",
  "sgseo28@pupils.nlcsjeju.kr": "Sung Seo"
};

export const getStudentName = (email: string): string => {
  const normalized = email.toLowerCase().trim();
  if (studentNames[normalized]) return studentNames[normalized];
  
  const namePart = email.split("@")[0].replace(/\d+/g, "");
  if (namePart.length <= 3) return namePart.toUpperCase();
  
  const commonSurnames = ["kim", "lee", "park", "ahn", "choi", "jung", "kang", "cho", "yoon", "lim", "shin", "han", "eun", "huh", "hong", "jang", "baek", "li", "seol", "yang", "seo", "shim"];
  for (const surname of commonSurnames) {
    if (namePart.endsWith(surname) && namePart.length > surname.length) {
      const forename = namePart.substring(0, namePart.length - surname.length);
      return (forename.charAt(0).toUpperCase() + forename.slice(1)) + " " + (surname.charAt(0).toUpperCase() + surname.slice(1));
    }
  }
  return namePart.charAt(0).toUpperCase() + namePart.slice(1);
};

export const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }
  return name.substring(0, 3).toUpperCase();
};
