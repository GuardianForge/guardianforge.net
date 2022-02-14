class FeatureToggle {
  name: string
  key: string
  value?: boolean

  constructor(name: string, value?: boolean) {
    if(name.includes(" ")) {
      throw new Error("Spaces not allowed")
    }

    this.name = name
    this.key = `toggle_${name}`
    this.value = value
  }

  toggle() {
    if(!this.isEnabled()) {
      localStorage.setItem(this.key, "true")
    } else {
      localStorage.removeItem(this.key)
    }
  }

  isEnabled(): boolean {
    if(this.value) {
      return this.value
    }

    if(localStorage.getItem(this.key) === "true") {
      return true
    }
    return false
  }
}

export default FeatureToggle