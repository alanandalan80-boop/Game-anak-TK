window.CeriaGames = (() => {
  const objects = ["🍎","🍓","⭐","🐠","🌼","⚽","🍌","🦋","🍪","🎈"];
  const rand = n => Math.floor(Math.random() * n);
  const int = (min, max) => min + rand(max - min + 1);
  const pick = arr => arr[rand(arr.length)];
  const shuffled = arr => arr.map(v => [Math.random(), v]).sort((a,b) => a[0]-b[0]).map(x=>x[1]);
  function choices(correct, max = 10) {
    const set = new Set([correct]);
    while (set.size < 3) set.add(Math.max(0, Math.min(max, correct + int(-3, 3))));
    return shuffled([...set]);
  }
  function objectSet(count, object) {
    return `<div class="object-set" aria-label="${count} benda">${Array.from({length: count}, (_,i)=>`<span style="animation-delay:${i*35}ms">${object}</span>`).join("")}</div>`;
  }
  function makeQuestion(mode, level = 1) {
    if (mode === "numbers") {
      const n = int(1, 10);
      return { title: `Ini angka berapa?`, hint: "Pilih angka yang sama dengan angka besar.", visual: `<div class="math-expression">${n}</div>`, answer: n, options: choices(n), say: `Ini angka ${n}.` };
    }
    if (mode === "count") {
      const n = int(1, level === 1 ? 5 : 10), obj = pick(objects);
      return { title: "Ayo hitung benda ini!", hint: "Hitung satu per satu, lalu pilih jumlahnya.", visual: objectSet(n, obj), answer: n, options: choices(n), say: `Ada ${n} benda.` };
    }
    if (mode === "addition") {
      const max = level === 1 ? 5 : 10, a = int(1, max - 1), b = int(1, max - a), obj = pick(objects), sum = a + b;
      return { title: "Berapa jumlah semuanya?", hint: "Gabungkan kedua kelompok benda.", visual: `<div class="object-set">${Array.from({length:a},()=>`<span>${obj}</span>`).join("")}</div><div class="math-expression">+</div><div class="object-set">${Array.from({length:b},()=>`<span>${obj}</span>`).join("")}</div>`, answer: sum, options: choices(sum, max), say: `${a} ditambah ${b} sama dengan ${sum}.` };
    }
    if (mode === "subtraction") {
      const max = level === 1 ? 5 : 10, a = int(2, max), b = int(1, a - 1), obj = pick(objects), answer = a - b;
      return { title: "Berapa yang tersisa?", hint: "Bayangkan beberapa benda pergi.", visual: `<div class="math-expression">${a} − ${b} = ?</div>${objectSet(a, obj)}`, answer, options: choices(answer, max), say: `${a} dikurangi ${b} sama dengan ${answer}.` };
    }
    if (mode === "match") {
      const n = int(1, 10), obj = pick(objects);
      return { title: "Cocokkan angka dan benda!", hint: "Pilih angka yang sesuai dengan jumlah benda.", visual: objectSet(n, obj), answer: n, options: choices(n), say: `Jumlahnya ${n}.` };
    }
    const kind = pick(["count","addition","subtraction"]);
    return makeQuestion(kind, level);
  }
  return { makeQuestion };
})();
