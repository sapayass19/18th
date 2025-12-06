document.addEventListener('DOMContentLoaded', () => {
    // ===================================
    // === Inisialisasi Elemen DOM ===
    // ===================================
    const contentBox = document.getElementById('contentBox');
    const openMessageBtn = document.getElementById('openMessageBtn');
    const messageOverlay = document.getElementById('messageOverlay');
    const closePopupBtn = document.getElementById('closePopupBtn');
    const skipTypingElement = document.getElementById('skipTypingBtn');
    const body = document.body;
    const birthdayMusic = document.getElementById('birthdayMusic');
    const birthdayMessage = document.getElementById('birthdayMessage');
    const muteBtn = document.getElementById('muteBtn');

    // === Elemen Baru untuk Pilihan Musik ===
    const musicChoiceOverlay = document.getElementById('musicChoiceOverlay');
    const playMusicBtn = document.getElementById('playMusicBtn');
    const noMusicBtn = document.getElementById('noMusicBtn');

    // === Elemen Baru: Elemen untuk Countdown ===
    const countdownOverlay = document.getElementById('countdownOverlay');
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    
    // === State dan Variabel Typing Effect ===
    let typingInterval;
    let currentProgress = 0;
    const fullText = birthdayMessage ? birthdayMessage.getAttribute('data-full-text') : '';
    let isFinishedTyping = false;
    const typingSpeed = 40; // Kecepatan mengetik (ms per karakter)
    
    // Flag untuk tahu apakah musik sudah diizinkan
    let musicAllowed = false; 

    // ===================================
    // ## VARIABEL KUNCI: TANGGAL HARI H
    // ===================================
    // GANTI TANGGAL INI KE TANGGAL ULANG TAHUN SEBENARNYA!
    const targetDate = new Date("December 11, 2025 00:00:00").getTime();
    // const targetDate = new Date(Date.now() + 10 * 1000); // Digunakan untuk tes (10 detik dari sekarang)
    let countdownInterval;


    // ===================================
    // ## FUNGSI UTAMA COUNTDOWN
    // ===================================

    function updateCountdown() {
        // Mendapatkan waktu saat ini
        const now = new Date().getTime();
        // Menghitung sisa waktu (dalam milidetik)
        const distance = targetDate - now;

        // Cek apakah Hari H sudah tiba
        if (distance < 0) {
            // HENTIKAN INTERVAL
            clearInterval(countdownInterval);
            // Panggil fungsi penanganan Hari H
            handleDayH();
            return; // Hentikan fungsi
        }

        // Perhitungan waktu untuk Hari, Jam, Menit, Detik
        const ONE_SECOND = 1000;
        const ONE_MINUTE = ONE_SECOND * 60;
        const ONE_HOUR = ONE_MINUTE * 60;
        const ONE_DAY = ONE_HOUR * 24;

        const days = Math.floor(distance / ONE_DAY);
        const hours = Math.floor((distance % ONE_DAY) / ONE_HOUR);
        const minutes = Math.floor((distance % ONE_HOUR) / ONE_MINUTE);
        const seconds = Math.floor((distance % ONE_MINUTE) / ONE_SECOND);

        // Memperbarui tampilan DOM (pastikan selalu dua digit)
        daysEl.textContent = String(days).padStart(2, '0');
        hoursEl.textContent = String(hours).padStart(2, '0');
        minutesEl.textContent = String(minutes).padStart(2, '0');
        secondsEl.textContent = String(seconds).padStart(2, '0');
    }
    
    // Fungsi untuk memulai timer dan cek awal
    function startCountdown() {
        // Cek status pertama kali saat halaman dimuat
        const now = new Date().getTime();
        const distance = targetDate - now;

        if (distance < 0) {
            // Jika Hari H SUDAH LEWAT, langsung panggil handleDayH
            handleDayH(true); // Kirim flag 'isPast'
        } else {
            // Jika Hari H BELUM TIBA, mulai countdown
            // Update pertama kali agar tampilan tidak kosong
            updateCountdown(); 
            // Atur interval update setiap 1 detik
            countdownInterval = setInterval(updateCountdown, 1000);
        }
    }
    
    // Fungsi yang menangani transisi setelah Hari H
    function handleDayH(isPast = false) {
        // 1. Countdown fade out
        if (isPast) {
            body.classList.remove('content-hidden'); 
            countdownOverlay.classList.add('hide');
        } else {
            // Jika Hari H baru tiba saat ini, lakukan transisi:
            countdownOverlay.classList.add('hide');
        }
        
        // Timeout untuk menunggu animasi fade out selesai (1 detik sesuai CSS)
        setTimeout(() => {
            // 2. Tampilkan pilihan musik
            // Hapus class 'content-hidden' agar konten utama terlihat
            body.classList.remove('content-hidden'); 
            
            // Tampilkan overlay pilihan musik
            musicChoiceOverlay.classList.remove('hide');
        }, 1000); 
    }

    // ===================================
    // ## FUNGSI KONTROL AUDIO (Mute/Unmute)
    // ===================================
    function toggleMute() {
        if (birthdayMusic.muted) {
            birthdayMusic.muted = false;
            muteBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
        } else {
            birthdayMusic.muted = true;
            muteBtn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
        }
    }
    
    // ===================================
    // ## FUNGSI POPUP & TYPING EFFECT (SUDAH DIPERBAIKI)
    // ===================================

    // Fungsi untuk memulai efek mengetik
    function startTypingEffect() {
        // 1. Reset state jika tombol diklik lagi
        isFinishedTyping = false;
        currentProgress = 0;
        birthdayMessage.innerHTML = '';
        skipTypingElement.textContent = 'Tampilkan Semua Pesan';
        // Pastikan tombol skip ditampilkan saat typing dimulai
        skipTypingElement.style.display = 'block'; // Tampilkan tombol skip
        
        // Hentikan interval lama jika ada
        clearTimeout(typingInterval); 
        
        // Mulai fungsi mengetik utama
        function typing() {
            if (currentProgress < fullText.length) {
                let char = fullText.charAt(currentProgress);

                // Logika untuk melompati tag HTML (misal: <b>, <br>) atau Entity Code (misal: &ldquo;)
                if (char === '<' || char === '&') {
                    let endIndex = -1;
                    
                    // Cari akhir dari Tag HTML (misalnya: </b> atau <br>)
                    if (char === '<') {
                        endIndex = fullText.indexOf('>', currentProgress);
                    } 
                    // Cari akhir dari Entity Code (misalnya: &rdquo;)
                    else if (char === '&') {
                        endIndex = fullText.indexOf(';', currentProgress);
                    }
                    
                    // Jika tag atau entity code valid ditemukan
                    if (endIndex !== -1) {
                        // Tambahkan seluruh tag/entity ke konten
                        birthdayMessage.innerHTML += fullText.substring(currentProgress, endIndex + 1);
                        // Langsung pindahkan progress melewati tag/entity
                        currentProgress = endIndex + 1; 
                    } else {
                        // Jika bukan tag valid, perlakukan sebagai karakter biasa (fallback)
                        birthdayMessage.innerHTML += char;
                        currentProgress++;
                    }
                } else {
                    // Karakter biasa (bukan tag)
                    birthdayMessage.innerHTML += char;
                    currentProgress++;
                }

                // Auto-scroll ke bawah (jika pesan panjang)
                birthdayMessage.scrollTop = birthdayMessage.scrollHeight; 
                
                typingInterval = setTimeout(typing, typingSpeed);
            } else {
                // Jika sudah selesai mengetik
                clearTimeout(typingInterval);
                isFinishedTyping = true;
                skipTypingElement.style.display = 'none'; // Sembunyikan tombol skip
                openMessageBtn.textContent = 'Baca Lagi Pesannya'; // Ubah teks tombol utama
                openMessageBtn.disabled = false;
            }
        }
        
        // Jalankan loop pertama dengan setTimeout
        typingInterval = setTimeout(typing, typingSpeed); 
    }
    
    // Fungsi untuk menampilkan pesan sepenuhnya
    function skipTyping() {
        clearTimeout(typingInterval);
        birthdayMessage.innerHTML = fullText;
        isFinishedTyping = true;
        skipTypingElement.style.display = 'none';
    }


    // ===================================
    // ## EVENT LISTENERS
    // ===================================
    
    // Pilihan Musik - YA
    playMusicBtn.addEventListener('click', () => {
        musicAllowed = true;
        musicChoiceOverlay.classList.add('hide');
        
        // Mainkan musik, lalu tampilkan tombol kontrol
        birthdayMusic.play().then(() => {
            // Pastikan musik dimulai, lalu tampilkan tombol kontrol
            muteBtn.classList.add('show');
            birthdayMusic.loop = true; // Set looping
        }).catch(error => {
            // Tangani error autoplay jika browser memblokir
            console.warn("Autoplay diblokir:", error);
            muteBtn.classList.add('show'); 
        });

        // Tampilkan konten utama dan tombol pesan setelah pilihan musik
        contentBox.style.opacity = '1';
        contentBox.style.transform = 'translateY(0)';
    });

    // Pilihan Musik - TIDAK
    noMusicBtn.addEventListener('click', () => {
        musicAllowed = false;
        musicChoiceOverlay.classList.add('hide');

        // Tampilkan konten utama dan tombol pesan
        contentBox.style.opacity = '1';
        contentBox.style.transform = 'translateY(0)';
    });

    // Kontrol Mute/Unmute
    muteBtn.addEventListener('click', toggleMute);

// Buka Pop-up Pesan 
    openMessageBtn.addEventListener('click', () => {
        messageOverlay.classList.add('show');
        body.classList.add('overlay-active');
        openMessageBtn.disabled = true;

        // --- KODE PERBAIKAN DI SINI ---
        if (isFinishedTyping) {
            // Jika sudah pernah selesai atau dilompati, tampilkan pesan instan
            birthdayMessage.innerHTML = fullText;
        } else {
            // Jika belum selesai (atau baru pertama kali), mulai efek mengetik
            startTypingEffect();
        }
        // ------------------------------

        // Trigger Confetti saat pop-up dibuka
        triggerConfettiEffect();
    });
    // Tutup Pop-up Pesan
    closePopupBtn.addEventListener('click', () => {
        clearTimeout(typingInterval); // Hentikan efek mengetik
        // Pastikan teks penuh ditampilkan saat ditutup
        if (!isFinishedTyping) { 
            birthdayMessage.innerHTML = fullText;
        } 
        
        messageOverlay.classList.remove('show');
        body.classList.remove('overlay-active');
        
        openMessageBtn.disabled = false;
        openMessageBtn.textContent = isFinishedTyping ? 'Baca Lagi Pesannya' : 'Lanjut Baca Pesannya';
    });

    // Tombol Skip Typing
    skipTypingElement.addEventListener('click', skipTyping);


    // ===================================
    // ## FUNGSI Confetti Effect
    // ===================================
    function getRandomColor() {
        return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    }

    function triggerConfettiEffect() {
        const confettiContainer = document.getElementById('confetti-container');
        confettiContainer.innerHTML = '';
        
        const count = 50;
        for (let i = 0; i < count; i++) {
            const piece = document.createElement('div');
            piece.classList.add('confetti-piece');
            piece.style.left = `${Math.random() * 100}vw`;
            piece.style.backgroundColor = getRandomColor();
            piece.style.width = `${Math.random() * 8 + 4}px`;
            piece.style.height = `${Math.random() * 8 + 4}px`;
            piece.style.animationDuration = `${Math.random() * 3 + 2}s`;
            piece.style.animationDelay = `${Math.random() * 2}s`;
            piece.style.transform = `rotate(${Math.random() * 360}deg)`;
            confettiContainer.appendChild(piece);
        }
    }
    
    // ===================================
    // ## INISIALISASI: MULAI COUNTDOWN
    // ===================================
    startCountdown();

}); // Akhir dari DOMContentLoaded