 // Bir ürüne ait depodaki en eski partinin tarihini getirme yardımı (FIFO için odadaki ilk tarih)
    function getOldestPartyDate(productId) {
        let matches = depotParties.filter(p => p.productId === productId && p.qty > 0);
        if(matches.length === 0) return "2026-12-31";
        // Tarihe göre sırala
        matches.sort((a,b) => new Date(a.expiry) - new Date(b.expiry));
        return matches[0].expiry;
    }

function getSktBadge(expiryDateStr) {
    if(!expiryDateStr) return `<span class="skt-badge skt-ok">SKT Yok</span>`;
    
    // Sabit tarih yerine o anki zamanı alıyoruz
    const today = new Date(); 
    // Saat, dakika farkından etkilenmemek için sadece tarihi sıfırlıyoruz
    today.setHours(0,0,0,0);
    
    const expiryDate = new Date(expiryDateStr);
    const timeDiff = expiryDate - today;
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    if (daysDiff < 0) { 
        return `<span class="skt-badge skt-expired">Süresi Doldu!</span>`; 
    } else if (daysDiff <= 30) { 
        return `<span class="skt-badge skt-warning">Yetersiz (${daysDiff} Gün)</span>`; 
    } else { 
        return `<span class="skt-badge skt-ok">Güvenli</span>`; 
    }
}