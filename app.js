const express = require('express');
const fs = require('fs');
const nodemailer = require('nodemailer');
const app = express();

app.use(express.json());

app.use((req, res, next) => {
    const ipAddress = req.ip;

    // IP 주소를 JSON 파일에 추가
    const ipData = { ipAddress, timestamp: new Date() };
    saveToJSON(ipData);

    // 여기서 추가적인 작업을 수행할 수 있습니다.

    // 이메일 전송
    sendEmail(ipAddress);

    next();
});

app.get('/', (req, res) => {
    // JSON 파일에서 IP 주소 정보를 읽어와서 화면에 표시
    const ipData = readJSON();
    if (ipData.length > 0) {
        res.send(`Received a request from IP address: ${ipData[0].ipAddress} at ${ipData[0].timestamp}`);
    } else {
        res.send("No IP data available.");
    }
});

app.get('/api/ipData', (req, res) => {
    const ipData = readJSON();
    res.json(ipData);
});

app.get('/view', (req, res) => {
    const ipData = readJSON();
    res.render('view', { ipData });
});

const saveToJSON = (data) => {
    const jsonData = JSON.stringify(data, null, 2);
    fs.appendFileSync('ip_data.json', jsonData + '\n');
};

const readJSON = () => {
    try {
        if (fs.existsSync('ip_data.json')) {
            const data = fs.readFileSync('ip_data.json', 'utf8');
            if (data.trim() === '') {
                return [];
            }
            const jsonDataArray = data.trim().split('\n').map((line, index) => {
                try {
                    return JSON.parse(line);
                } catch (parseError) {
                    console.error(`Error parsing JSON data on line ${index + 1}: ${parseError.message}`);
                    return null;
                }
            }).filter(Boolean);

            return jsonDataArray;
        } else {
            console.error('JSON file does not exist.');
            return [];
        }
    } catch (error) {
        console.error('Error reading JSON file:', error);
        return [];
    }
};

// 이메일 전송 함수
function sendEmail(ipAddress) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'woldeog12@gmail.com',
            pass: 'bpvk oaca iusm zixe'
        }
    });

    const mailOptions = {
        from: 'jungchwimisaenghwal63@gmail.com',
        to: 'jungchwimisaenghwal63@gmail.com',
        subject: 'New IP Address Notification',
        text: `A request has been received from IP address: ${ipAddress}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
}

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
