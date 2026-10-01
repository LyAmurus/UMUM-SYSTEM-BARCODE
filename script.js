// ==========================================
// AREA KONFIGURASI SESUAI DOKUMENTASI RESMI
// ==========================================
const API_URL = "https://web.mark.toewin.com/webapi1/channel/api/codeStatusInfo/tCheckCode";
const BRAND_ID = 2140;                 
const ACCOUNT = "toewin1074"; 
const PASSWORD = "ljaDe7T8N3YvT9Ka";   // Sesuai dokumentasi menggunakan passWord
// ==========================================

function prosesVerifikasi() {
    const inputVal = document.getElementById('barcode-input').value;
    const btn = document.getElementById('verify-btn');
    const btnText = document.getElementById('btn-text');
    const spinner = document.getElementById('loading-spinner');
    const resultCard = document.getElementById('result-card');

    // 1. Validasi Input Kosong
    if(inputVal.trim() === "") {
        alert("Harap masukkan kode terlebih dahulu.");
        return;
    }

    // 2. Atur Tampilan Status Loading
    resultCard.classList.remove('show');
    btn.disabled = true;
    btnText.innerText = "Memverifikasi...";
    spinner.style.display = "block";

    // 3. PENTING: Sesuai dokumentasi, parameter password ditulis 'passWord' (W besar)
    const rawString = `brandId=${BRAND_ID}&account=${ACCOUNT}&passWord=${PASSWORD}&type=1&fwm=${inputVal}`;
    
    // Enkripsi ke MD5 lalu jadikan huruf kapital (Uppercase)
    const signHash = CryptoJS.MD5(rawString).toString().toUpperCase();

    // 4. Siapkan Data Payload (Format JSON)
    const payloadData = {
        "brandId": BRAND_ID,
        "account": ACCOUNT,
        "fwm": inputVal,
        "type": 1, 
        "sign": signHash
    };

    // 5. Kirim Permintaan ke API TOEWIN
    fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payloadData)
    })
    .then(response => response.json())
    .then(data => {
        // Kembalikan Tombol ke Semula
        btn.disabled = false;
        btnText.innerText = "Verifikasi Produk";
        spinner.style.display = "none";

        // 6. Tanggapan Respon Berdasarkan Format Asli Dokumentasi
        if (data._success === true) {
            // Jika Kode Asli / Valid
            resultCard.className = "result-card status-success show";
            
            const totalScan = data._data?.C || 1;
            const tglPertama = data._data?.E || "Baru saja";
            
            resultCard.innerHTML = `
                ✨ <b>${data._message || "PRODUK TERVERIFIKASI ASLI"}</b><br>
                <hr style="margin: 8px 0; border: 0.5px solid #c8e6c9;">
                <span style='font-size:11px; color:#388e3c;'>Telah dicek: ${totalScan} kali | Pengecekan pertama: ${tglPertama}</span>
            `;
        } else {
            // Jika Kode Tidak Valid / Palsu / Sudah Kedaluwarsa
            resultCard.className = "result-card status-error show";
            resultCard.innerHTML = `
                ⚠️ <b>KODE TIDAK VALID</b><br>
                <span style='font-size:12px; font-weight:400;'>${data._message || "Waspada produk tiruan atau kode sudah tidak aktif."}</span>
            `;
        }
    })
    .catch(error => {
        // Penanganan Error Jaringan / CORS
        console.error('Error Terdeteksi:', error);
        btn.disabled = false;
        btnText.innerText = "Verifikasi Produk";
        spinner.style.display = "none";
        
        alert("Gagal terhubung ke server. Pastikan ekstensi pemblokir CORS di browser sudah aktif (ON).");
    });
}