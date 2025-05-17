from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

users = {}
user_builds = {}

components = {
    "CPU": {"name": "Ryzen 5 5600X", "price": 180000, "socket": "AM4", "desc": "6코어 12스레드, 높은 가성비"},
    "GPU": {"name": "RTX 4060", "price": 400000, "desc": "DLSS 3 지원, 1080p 최적화"},
    "RAM": {"name": "DDR4 16GB", "price": 70000, "type": "DDR4", "desc": "8GB x2 구성, 3200MHz"},
    "SSD": {"name": "NVMe 500GB", "price": 80000, "desc": "PCIe 3.0, 빠른 부팅용"},
    "Mainboard": {"name": "B550 보드", "price": 120000, "socket": "AM4", "ram_type": "DDR4", "desc": "AM4, 기본 확장성"},
    "Power": {"name": "650W 파워", "price": 70000, "desc": "브론즈 인증, 충분한 전력"},
    "Case": {"name": "미들타워 케이스", "price": 60000, "desc": "ATX 지원, 기본 쿨링"},
}

alternatives = {
    "CPU": [
        {"name": "Ryzen 5 7600X", "price": 220000, "socket": "AM5", "desc": "Zen 4, DDR5 지원"},
        {"name": "Intel i5-13400F", "price": 210000, "socket": "LGA1700", "desc": "10코어 하이브리드 구조"},
    ],
    "Mainboard": [
        {"name": "B650 보드", "price": 150000, "socket": "AM5", "ram_type": "DDR5", "desc": "신형 플랫폼"},
        {"name": "Z690 보드", "price": 180000, "socket": "LGA1700", "ram_type": "DDR5", "desc": "고급 인텔 보드"},
        {"name": "B550 보드", "price": 120000, "socket": "AM4", "ram_type": "DDR4", "desc": "가성비 보드"},
    ]
}


@app.route("/register", methods=["POST"])
def register():
    data = request.json
    nickname = data.get("nickname")
    pin = data.get("pin")
    if nickname in users:
        return jsonify({"success": False, "message": "이미 존재하는 닉네임입니다."})
    users[nickname] = pin
    return jsonify({"success": True, "message": "회원가입 완료"})


@app.route("/login", methods=["POST"])
def login():
    data = request.json
    nickname = data.get("nickname")
    pin = data.get("pin")
    if users.get(nickname) == pin:
        return jsonify({"success": True})
    return jsonify({"success": False, "message": "닉네임 또는 PIN이 틀립니다."})


@app.route("/recommend", methods=["POST"])
def recommend():
    return jsonify(components)


@app.route("/search/<part>", methods=["POST"])
def search(part):
    cpu_name = request.json.get("cpu", "")
    cpu_socket = ""
    for cpu in [components['CPU']] + alternatives.get("CPU", []):
        if cpu["name"] == cpu_name:
            cpu_socket = cpu.get("socket")

    results = []
    for item in alternatives.get(part, []):
        if part == "Mainboard" and cpu_socket:
            if item.get("socket") == cpu_socket:
                results.append(item)
        else:
            results.append(item)

    return jsonify(results)


@app.route("/save", methods=["POST"])
def save():
    data = request.json
    user = data.get("nickname")
    pin = data.get("pin")
    build = data.get("data")
    if users.get(user) == pin:
        if user not in user_builds:
            user_builds[user] = []
        user_builds[user].append(build)
        return jsonify({"success": True})
    return jsonify({"success": False})


@app.route("/load", methods=["POST"])
def load():
    data = request.json
    user = data.get("nickname")
    pin = data.get("pin")
    if users.get(user) == pin:
        return jsonify(user_builds.get(user, []))
    return jsonify([])


if __name__ == "__main__":
    app.run()
