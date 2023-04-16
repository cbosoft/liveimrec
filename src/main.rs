#[macro_use]
extern crate rocket;

use std::env;
use std::net::Ipv4Addr;

use rocket::fs::FileServer;

#[launch]
fn rocket() -> _ {
    let ip: Ipv4Addr = match env::var("LIR_IP") {
        Ok(ip) => ip.as_str().parse().unwrap(),
        Err(_) => "127.0.0.1".parse().unwrap(),
    };
    let port: u16 = match env::var("LIR_PORT") {
        Ok(port) => port.as_str().parse().unwrap(),
        Err(_) => "8008".parse().unwrap(),
    };
    let config = rocket::Config {
        port: port,
        address: ip.into(),
        ..rocket::Config::debug_default()
    };

    rocket::custom(&config).mount("/", FileServer::from("site/"))
}
