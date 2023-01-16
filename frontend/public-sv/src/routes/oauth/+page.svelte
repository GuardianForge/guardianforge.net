<script>
  import { goto } from '$app/navigation';
	import { onMount } from "svelte";

  onMount(async () => {
    // if(!isConfigLoaded) return
    async function completeLogin() {
      let { search } = window.location
      search = search.replace("?", "")
      let query = {}
      search.split("&").forEach(el => {
        let split = el.split("=")
        // @ts-ignore
        query[split[0]] = split[1]
      })

      let nextState = localStorage.getItem("nextState")

      const { ForgeClient } = window.services

      // @ts-ignore
      await ForgeClient.completeLogin(query.code)
      // setDidOAuthComplete(true)

      if(nextState && !nextState.startsWith("/oauth")) {
        localStorage.removeItem("nextState")
        goto(nextState)
      } else {
        goto("/")
      }
    }
    try {
      completeLogin()
    } catch (err) {
      console.error(err)
      // let alert = new AlertDetail("An error occurred while logging in. Please try again later...", "Login Error", true, false)
      // dispatchAlert(alert)
    }
  });
</script>

<div>
  Loading...
</div>