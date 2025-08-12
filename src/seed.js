// src/seed.js
import { collection, getDocs, addDoc } from 'firebase/firestore';

const initialScenarios = [
  {
    scenario: "You receive an email from 'Netflix' saying your payment failed. It asks you to click a link to update your billing info. The sender's email is 'support@net-flix.com'.",
    options: ["Phishing", "Virus", "Safe"],
    answer: "Phishing",
    explanation: "Correct! The hyphen in 'net-flix.com' is a classic sign of a phishing attempt trying to mimic a real domain."
  },
  {
    scenario: "Your friend sends you a link to a 'free movie streaming' site. When you visit, it asks you to download a special video player to watch the movies.",
    options: ["Ransomware", "Trojan Malware", "Safe"],
    answer: "Trojan Malware",
    explanation: "Correct! Unsolicited software downloads, especially for 'free' content, are a common way to distribute Trojan malware."
  },
  {
    scenario: "You get a pop-up on your screen saying '5 viruses detected! Click here to clean your PC!'",
    options: ["Scareware", "Worm", "Legitimate Alert"],
    answer: "Scareware",
    explanation: "Correct! This is scareware, a tactic used to frighten you into buying useless or malicious software."
  },
  {
    scenario: "Your computer suddenly slows down, and you see a text file on your desktop named 'READ_ME_FOR_KEY.txt' that you didn't create.",
    options: ["Phishing", "Ransomware", "System Error"],
    answer: "Ransomware",
    explanation: "Correct! Unexplained performance issues and ransom notes like 'READ_ME' are hallmark signs of a ransomware infection."
  }
];

export const seedDatabase = async (db) => {
  const scenariosCollection = collection(db, 'scenarios');
  const snapshot = await getDocs(scenariosCollection);
  if (snapshot.empty) {
    console.log("Seeding database...");
    for (const scenario of initialScenarios) {
      await addDoc(scenariosCollection, scenario);
    }
  }
};