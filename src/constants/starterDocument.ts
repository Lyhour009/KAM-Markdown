export const STARTER_DOCUMENT_EN = `# Welcome to KAM-Markdown 🚀

A calm, high-performance **Markdown editor** with instant live preview and first-class **Khmer (ភាសាខ្មែរ)** & **English** typography.

Write on the left. Read on the right. Keep your work automatically.

---

## 🌟 Key Features

- **Live Split Preview:** Renders GitHub-Flavored Markdown in real-time.
- **Khmer Typography:** Perfect vertical line-height for subscripts and vowels (\`ក្ដ\`, \`ត្រឹមត្រូវ\`).
- **Zero Cloud Leak:** Everything is stored directly in your browser's \`localStorage\`.
- **Keyboard Shortcuts:** \`Ctrl+B\` for **Bold**, \`Ctrl+I\` for *Italic*, \`Tab\` for clean indentation.

---

## 🇰🇭 គំរូអក្សរខ្មែរ (Khmer Text Sample)

សួស្តីកម្ពុជា! KAM-Markdown គាំទ្រការវាយអក្សរខ្មែរតាម **Unicode Khmer** យ៉ាងរលូន ដោយគ្មានបញ្ហាកាត់ជើងអក្សរ ឬស្រៈឡើយ។

> **គតិបណ្ឌិតខ្មែរ៖**  
> *"ចេះមកពីរៀន មានមកពីរក"* — ការអាននិងការសរសេរ គឺជាស្ពានឆ្ពោះទៅរកចំណេះដឹង។

### 📋 បញ្ជីកិច្ចការ (Task List)
- [x] បង្កើតកម្មវិធីកែសម្រួល Markdown ទំនើប
- [x] រៀបចំ Font អក្សរខ្មែរ Kantumruy Pro & Noto Sans Khmer
- [ ] សរសេរកំណត់ត្រាប្រចាំថ្ងៃរបស់អ្នក

---

## 📊 Formatted Table Example

| ភាសា (Language) | កូដ (Code) | ស្ថានភាព (Status) | កម្រិតគាំទ្រ (Support) |
| :--- | :---: | :---: | :--- |
| **ភាសាខ្មែរ** | \`km\` | 🟢 Active | Native Unicode & Line Metrics |
| **English** | \`en\` | 🟢 Active | Full GFM & Monospace |

---

## 💻 Code Block Example

\`\`\`typescript
interface MarkdownNote {
  title: string;
  language: 'km' | 'en';
  content: string;
  createdAt: Date;
}

const welcomeNote: MarkdownNote = {
  title: "សួស្តី KAM-Markdown",
  language: "km",
  content: "រីករាយក្នុងការសរសេរ Markdown!",
  createdAt: new Date(),
};

console.log(\`Ready: \${welcomeNote.title}\`);
\`\`\`

---

## 🔗 Quick Actions to Try
1. Try editing any text on the left pane.
2. Click **Download .md** to save this file locally to your machine.
3. Switch themes using the **Theme** button in the header.
`

export const STARTER_DOCUMENT_KM = `# សូមស្វាគមន៍មកកាន់ KAM-Markdown 🚀

កម្មវិធីកែសម្រួល និងមើល **Markdown** ផ្ទាល់យ៉ាងរហ័ស ទំនើប និងគាំទ្រ **ភាសាខ្មែរ** និង **ភាសាអង់គ្លេស** យ៉ាងល្អឥតខ្ចោះ។

សរសេរនៅខាងឆ្វេង។ មើលលទ្ធផលនៅខាងស្តាំ។ រក្សាទុកការងារដោយស្វ័យប្រវត្តិ។

---

## 🌟 លក្ខណៈពិសេសចម្បង

- **ការមើលផ្ទាល់ភ្លាមៗ (Live Preview):** បង្ហាញលទ្ធផល GitHub-Flavored Markdown ពេលអ្នកកំពុងវាយអក្សរ។
- **ពុម្ពអក្សរខ្មែរស្រស់ស្អាត:** ប្រើប្រាស់ Kantumruy Pro និង Noto Sans Khmer មិនកាត់ជើង ឬស្រៈឡើយ។
- **សុវត្ថិភាពខ្ពស់:** ដំណើរការលើ Browser របស់អ្នកផ្ទាល់ (មិនបញ្ជូនទិន្នន័យទៅកាន់ Server ណាឡើយ)។
- **ផ្លូវកាត់ក្តារចុច:** \`Ctrl+B\` សម្រាប់ **អក្សរដិត**, \`Ctrl+I\` សម្រាប់ *អក្សរទ្រេត*។

---

## 📝 គំរូទម្រង់អត្ថបទ

> **សម្រង់គំនិត៖**  
> *"ការសរសេរ គឺជាការរៀបចំផ្នត់គំនិតឱ្យមានសណ្តាប់ធ្នាប់"*

### 📋 បញ្ជីកិច្ចការដែលត្រូវធ្វើ
- [x] រៀបចំទម្រង់អក្សរខ្មែរ និងអង់គ្លេស
- [x] បញ្ចូលមុខងាររំកិលអេក្រង់ស្របគ្នា (Sync Scroll)
- [ ] បើកឯកសារ \`.md\` ផ្ទាល់ខ្លួនរបស់អ្នក

---

## 📊 គំរូតារាងទិន្នន័យ

| ភាសា | កូដសម្គាល់ | ស្ថានភាព | កម្រិតគាំទ្រ |
| :--- | :---: | :---: | :--- |
| **ភាសាខ្មែរ** | \`km\` | 🟢 សកម្ម | គាំទ្រជើងអក្សរ និងស្រៈពេញលេញ |
| **English** | \`en\` | 🟢 សកម្ម | GFM ពេញលេញ |

---

## 💻 គំរូកូដកុំព្យូទ័រ (Code Block)

\`\`\`javascript
// មុខងារសួស្តី
function greetKhmer(name) {
  return \`សួស្តី \${name}! សូមរីករាយជាមួយ KAM-Markdown\`;
}

console.log(greetKhmer("មិត្តអ្នកអាន"));
\`\`\`

---

## 💡 ចាប់ផ្តើមសាកល្បង
1. សាកល្បងកែប្រែ ឬបន្ថែមអត្ថបទនៅប្រអប់ខាងឆ្វេង។
2. ចុចប៊ូតុង **ទាញយក .md** ដើម្បីរក្សាទុកឯកសារនេះលើកុំព្យូទ័ររបស់អ្នក។
3. ចុចប៊ូតុង **ស្បែក** នៅជ្រុងខាងលើដើម្បីប្តូរពណ៌ងងឹត ឬភ្លឺ។
`
