const express = require('express');
const app = express();
const axios = require('axios').default
const cookieParser = require('cookie-parser')

const TIIS_URL = "https://api.olahrago.id/api/v2"

import path from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const port = process.env.PORT || 6879

//Area
app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded())


app.set("views", path.join(__dirname, 'views'))
// set view engine menggunakan EJS
app.set('view engine', 'ejs');

// Mengatur EJS sebagai view engine
// Middleware untuk parsing body dari request
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

// Menampilkan halaman login
app.get('/', (req, res) => {
    res.render('login');
});

// Memproses data login
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    axios.post(TIIS_URL + "/auth/login", {
        "email": email,
        "password": password,
        "ref_type": "admin",
        "ismobile": "false"
    }).then(response => {
        res.cookie('token', response.data.data.token);
        res.cookie('data', response.data.data);
        res.redirect("/dashboard")
    }).catch(err => {
        res.redirect('/fail');
    })
});

// Halaman sukses login
app.get('/dashboard', (req, res) => {
    if (req.cookies.token === undefined) {
        res.redirect("/")
    }
    const data = req.cookies.data;
    res.render('dashboard', { data });
});

// Halaman gagal login
app.get('/fail', (req, res) => {
    res.render("fail")
});

app.get('/athletes', async (req, res) => {
    if (req.cookies.token === undefined) {
        res.redirect("/")
    }

    let athletes;

    await axios.get(TIIS_URL + `/athletes?page=${req.query.page || 1}&per_page=${req.query.per_page || 10}&grade=&regional_status=&search=&status=active`, {
        headers: {
            Authorization: `Bearer ${req.cookies.token}`
        }
    })
        .then(r => {
            athletes = r.data.data.data
        })


    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.per_page) || 10;

    // Lakukan operasi lain yang diperlukan untuk mendapatkan data atlet
    // Berdasarkan halaman dan jumlah item per halaman

    // Render halaman EJS dengan data atlet yang sesuai
    res.render('athletes', { athletes, page, perPage });
})

app.get('/athletes/:id', async (req, res) => {
    if (req.cookies.token === undefined) {
        res.redirect("/")
    }
    // Simulasikan data atlet dari database atau API
    let data
    await axios.get(TIIS_URL + `/athlete-detail/${req.params.id}`, {
        headers: {
            Authorization: `Bearer ${req.cookies.token}`
        }
    })
        .then(r => {
            data = r.data.data
        })


    // Render halaman EJS dan kirimkan data atlet
    res.render('detail', { data });
});

app.get('/card/:id', async (req, res) => {
    if (req.cookies.token === undefined) {
        res.redirect("/")
    }
    let data;
    axios.get(TIIS_URL + `/profile/${req.params.id}/card`, {
        headers: {
            Authorization: `Bearer ${req.cookies.token}`
        }
    })
        .then(r => {
            res.send(r.data)

        })
})



app.get("/logout", (req, res) => {
    res.clearCookie('token');
    res.clearCookie('data');
    res.redirect("/")
})

// Menjalankan server
app.listen(port, () => {
    console.log('Server berjalan pada port 3000');
});
