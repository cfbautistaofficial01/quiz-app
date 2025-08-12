// src/seed_day2.js
import { collection, getDocs, addDoc } from 'firebase/firestore';

// This is our local copy of the questions for the Day 2 activity.
const initialScenarios = [
  {
    scenario: "The firewall logs show 50 failed login attempts from the same IP address to a single user account within one minute.",
    options: ["Brute Force Attack", "DDoS Attack", "Normal Activity"],
    answer: "Brute Force Attack",
    severity: "Medium",
    explanation: "Correct! A high volume of failed logins from one source is a sign of a Brute Force attack. It's Medium severity because it's an attempt, but needs to be watched closely."
  },
  {
    scenario: "You receive an automated email from HR with the subject 'Updated Employee Handbook'. The attachment is a PDF file and the sender's email is internal.",
    options: ["Phishing", "Trojan Malware", "Safe"],
    answer: "Safe",
    severity: "Low",
    explanation: "Correct! This appears to be a legitimate internal communication. While caution is always wise, it has no immediate indicators of a threat, so it's considered Low severity."
  },
  {
    scenario: "An EDR alert shows that 'svchost.exe' is making a network connection to an IP address in a foreign country that the company does not do business with.",
    options: ["Potential C2 Beaconing", "Software Update", "Normal Activity"],
    answer: "Potential C2 Beaconing",
    severity: "High",
    explanation: "Correct! A critical system process making unexpected outbound connections is a strong indicator of a compromised host communicating with a Command & Control (C2) server. This is a High severity event."
  },
  {
    scenario: "A user reports that they can't access a shared network drive. Several other users in the same department report the same issue.",
    options: ["Ransomware", "Insider Threat", "Potential Outage"],
    answer: "Potential Outage",
    severity: "Low",
    explanation: "Correct! While this could be malicious, it's most likely a technical issue or network outage, not a direct security threat. It's a Low severity IT problem."
  },
  {
    scenario: "An IDS alert detects a 'Nikto' scan against your company's public web server.",
    options: ["Vulnerability Scanning", "Phishing", "Normal Activity"],
    answer: "Vulnerability Scanning",
    severity: "Medium",
    explanation: "Correct! Nikto is a web server scanner. This indicates someone is actively probing your website for weaknesses. This reconnaissance is a Medium severity event."
  },
  {
    scenario: "A user from the finance department clicks a link in an email that downloads a file named 'Invoice.zip'. Shortly after, their files are encrypted.",
    options: ["Ransomware", "Virus", "Adware"],
    answer: "Ransomware",
    severity: "Critical",
    explanation: "Correct! The encryption of files following a suspicious download is a clear sign of a Ransomware attack, which is always a Critical severity incident."
  },
  {
    scenario: "The SIEM correlates a successful login from an unusual country with an impossible travel event (e.g., user logged in from Manila and then from Moscow 5 minutes later).",
    options: ["Compromised Credentials", "VPN Use", "System Glitch"],
    answer: "Compromised Credentials",
    severity: "High",
    explanation: "Correct! Impossible travel is a very strong indicator that an account's credentials have been stolen and are being used by an attacker. This is a High severity alert."
  },
  {
    scenario: "A developer reports that they accidentally uploaded a file containing an API key to a public GitHub repository.",
    options: ["Data Leak", "Insider Threat", "No Risk"],
    answer: "Data Leak",
    severity: "Critical",
    explanation: "Correct! Exposing credentials like API keys in public is a Critical severity data leak. The key must be revoked immediately before it is abused."
  }
];

export const seedDay2Database = async (db) => {
  const scenariosCollection = collection(db, 'scenarios_day2');
  const snapshot = await getDocs(scenariosCollection);
  if (snapshot.empty) {
    console.log("Seeding database with Day 2 scenarios...");
    for (const scenario of initialScenarios) {
      await addDoc(scenariosCollection, scenario);
    }
  }
};
