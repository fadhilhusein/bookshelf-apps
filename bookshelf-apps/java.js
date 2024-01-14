const book = []
const RENDER_EVENT = "render-book"
const SEARCH_EVENT = "search-book"
const SAVED_EVENT = 'book-saved'
const BOOK_KEY = 'RakBuku'

document.addEventListener("DOMContentLoaded", () => {
    const submitForm = document.getElementById('inputBook');
    submitForm.addEventListener("submit", (event) => {
        event.preventDefault();
        addBook();
        resetInput();
    });

    const searchForm = document.getElementById('searchBook');
    searchForm.addEventListener('submit', (event) => {
        event.preventDefault();
        document.dispatchEvent(new Event(SEARCH_EVENT));
    });

    document.addEventListener(RENDER_EVENT, function () {
        const unCompleteBook = document.getElementById('incompleteBookshelfList')
        unCompleteBook.innerHTML = '';

        const inCompleteBook = document.getElementById('completeBookshelfList');
        inCompleteBook.innerHTML = '';

        for (const books of book) {
            const bookElement = makeList(books);
            if (!books.isComplete)
                unCompleteBook.append(bookElement);
            else
                inCompleteBook.append(bookElement);

        }
    });

    document.addEventListener(SEARCH_EVENT, () => {
        const hasilCarian = resultBook()
        if (hasilCarian !== undefined) {
            const unCompleteBook = document.getElementById('incompleteBookshelfList')
            unCompleteBook.innerHTML = '';

            const inCompleteBook = document.getElementById('completeBookshelfList');
            inCompleteBook.innerHTML = '';

            for (const book of hasilCarian) {
                const bookElement = makeList(book)
                if (!book.isComplete)
                    unCompleteBook.append(bookElement);
                else
                    inCompleteBook.append(bookElement);
            }
        }
    });
});

function generateID() {
    return +new Date()
};

function isStorageExist() {
    if (typeof (Storage) === 'undefined') {
        alert('Browser Kamu Tidak Mendukung LocalStorage')
        return false;
    }
    return true;
}

function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(book);
        localStorage.setItem(BOOK_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

function generateBookObject(id, judul, penulis, tahun, isComplete) {
    return {
        id,
        judul,
        penulis,
        tahun,
        isComplete
    };
};

function addBook() {
    const judulBuku = document.getElementById('inputBookTitle').value
    const penulisBuku = document.getElementById('inputBookAuthor').value
    const tahunBuku = document.getElementById('inputBookYear').value
    const isComplete = document.getElementById('inputBookIsComplete').checked

    const generateId = generateID();
    const bookObject = generateBookObject(generateId, judulBuku, penulisBuku, tahunBuku, isComplete);
    book.push(bookObject)

    Swal.fire(
        'Berhasil',
        `Buku '${judulBuku}' anda sudah dimasukan!`,
        'success'
    );
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
};

function resetInput() {
    document.getElementById('inputBookTitle').value = '';
    document.getElementById('inputBookAuthor').value = '';
    document.getElementById('inputBookYear').value = '';
    document.getElementById('inputBookIsComplete').checked = false;
}

function resultBook() {
    const judulBuku = document.getElementById('searchBookTitle').value;
    const bukuCarian = book.filter((books) => books.judul.includes(judulBuku))

    if (judulBuku !== '') {
        if (bukuCarian.length !== 0) {
            return bukuCarian;
        } else {
            Swal.fire(
                'Buku yang anda cari tidak ada?',
                'Mohon masukan nama buku anda dengan benar!',
                'question'
            );
            return book
        }
    } else {
        Swal.fire(
            'Gagal mencari buku anda!', 'Anda belum memasukan nama buku!', 'warning'
        );
    }
}

function makeList(bookObject) {
    const judulBuku = document.createElement('h3');
    judulBuku.innerText = bookObject.judul;

    const penulisBuku = document.createElement('p');
    penulisBuku.innerText = bookObject.penulis;

    const tahunBuku = document.createElement('p');
    tahunBuku.innerText = bookObject.tahun;

    const container = document.createElement('article');
    container.classList.add('book_item');
    container.getAttribute('class')
    container.append(judulBuku, penulisBuku, tahunBuku);
    container.setAttribute('id', `book-${bookObject.id}`)

    if (bookObject.isComplete) {
        const undoBook = document.createElement('button');
        undoBook.classList.add('green');
        undoBook.innerText = 'Kembali Baca';

        undoBook.addEventListener('click', () => {
            bukuKembali(bookObject.id)
        });

        const hapusBuku = document.createElement('button');
        hapusBuku.classList.add('red');
        hapusBuku.innerText = 'Hapus Buku';

        hapusBuku.addEventListener('click', () => {
            hapusBook(bookObject.id);
        });

        const containers = document.createElement('div');
        containers.classList.add('action');
        containers.append(undoBook, hapusBuku);

        container.append(containers)

    } else {
        const selesaiBaca = document.createElement('button');
        selesaiBaca.classList.add('green');
        selesaiBaca.innerText = 'Selesai Baca';

        selesaiBaca.addEventListener('click', () => {
            bukuSelesai(bookObject.id)
        });

        const hapusBuku = document.createElement('button');
        hapusBuku.classList.add('red');
        hapusBuku.innerText = 'Hapus Buku';

        hapusBuku.addEventListener('click', () => {
            hapusBook(bookObject.id);
        });

        const containers = document.createElement('div');
        containers.classList.add('action');
        containers.append(selesaiBaca, hapusBuku)

        container.append(containers);
    };

    return container;
};

function bukuSelesai(bukuID) {
    const bukuTarget = findBuku(bukuID);

    if (bukuTarget == null) return;

    bukuTarget.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData()
};

function hapusBook(bukuID) {
    const bukuTarget = findBukuIndex(bukuID);

    if (bukuTarget == -1) return;

    book.splice(bukuTarget, 1);
    Swal.fire('Berhasil', 'Buku anda sudah terhapus!', 'success')
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData()
};

function bukuKembali(bukuID) {
    const bukuTarget = findBuku(bukuID);

    if (bukuTarget == null) return;

    bukuTarget.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData()
};

function findBuku(bukuID) {
    for (const bukuItem of book) {
        if (bukuItem.id == bukuID) {
            return bukuItem;
        }
    };
    return null;

};

function findBukuIndex(bukuIndex) {
    for (const index in book) {
        if (book[index].id == bukuIndex) {
            return index;
        }
    }
    return -1;
}

function loadDataStorage() {
    const sterilizedData = localStorage.getItem(BOOK_KEY);
    const data = JSON.parse(sterilizedData);

    if (data !== null) {
        for (const buku of data) {
            book.push(buku);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
};

document.addEventListener('DOMContentLoaded', () => {
    if (isStorageExist()) {
        loadDataStorage();
    }
})