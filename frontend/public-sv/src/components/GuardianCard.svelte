<script lang="ts">
	import { goto } from "$app/navigation";
	import { onMount } from "svelte";
  import { classes, races } from "../constants"

  export let membershipType: string;
  export let membershipId: string;
  export let characterId: string;
  export let emblemBackgroundPath: string;
  export let classType: number;
  export let raceType: number;
  export let light: string;

  let className: string;
  let raceName: string;
  let guardianKey: string;

  onMount(() => {
    className = classes[classType]
    raceName = races[raceType]
    guardianKey = `${membershipType}-${membershipId}-${characterId}`
  })
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="guardian-card"
  style={`background-image: url('https://www.bungie.net/${emblemBackgroundPath}')`}
  on:click={() => goto(`/g/${guardianKey}`)}>
  <div class="character-card-left">
    <span class="class-name">{className}</span>
    <span class="race-name">{raceName}</span>
  </div>
  <div class="character-card-right">
    <span class="light">{light}</span>
  </div>
</div>

<style lang="scss">
  .guardian-card {
    height: 96px;
    width: 474px;
    margin-bottom: 7px;
    border-radius: 5px;
    display: flex;
    justify-content: space-between;
    box-shadow: 2px 2px 2px rgba(0,0,0,0.05);
    border: 1px solid rgba(0,0,0,0);

    &:hover {
      cursor: pointer;
      border: 1px solid #777;
    }
    .class-name {
      color: #eee;
      font-weight: bold;
      font-size: 1.5rem;
    }
    .race-name {
      color: #aaa;
      font-size: 1.1rem;
    }
    .light {
      font-weight: bold;
      font-size: 1.8rem;
      color: #e5d163;
      text-shadow: 0 2px 1px rgba(0,0,0,0.2);
    }
    .character-card-left {
      padding: 10px 50px 0px 110px;
      display: flex;
      flex-direction: column;
      text-align: left;
    }
    .character-card-right {
      padding: 10px;
    }

    @media only screen and (max-width: 474px) {
      width: 100%;
    }
  }
</style>