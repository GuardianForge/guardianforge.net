## Deps

---

_APT Packages_

- sudo apt install make
- sudo apt install awscli
- sudo apt install unzip

_Go_

- Download the library from: https://golang.org/dl/
- Unzip: `sudo rm -rf /usr/local/go && sudo tar -C /usr/local -xzf go*.tar.gz`
- Add `export PATH=$PATH:/usr/local/go/bin` to **$HOME/.profile** or **/etc/profile**
- Load profile with `source $HOME/.profile`
- Test with `go version`

_SAM_

- Download the lib from: https://github.com/aws/aws-sam-cli/releases/latest/download/aws-sam-cli-linux-x86_64.zip
- Unzip
- Run `sudo ./install`
- Test with `sam --version`

## Setup

- Add aws creds with `aws configure`
