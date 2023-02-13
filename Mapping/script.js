'use strict';

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

let map, mapEvent;

class Workout{
	date = new Date();
	id = (new Date() + '').slice(-10);
	clicks = 0

	constructor(coords, distance, duration){
		this.coords = coords // lat lng
		this.distance = distance // in kilometre
		this.duration = duration // in minute
	}
	setDesc(){
// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on 
  ${months[this.date.getMonth()]}
  ${this.date.getDate()}`
	}

	clicks(){
		this.clicks++
	}
	}

	class Running extends Workout{
		type = 'running'
		constructor(coords, distance, duration, cadence){
            super(coords, distance, duration)
			this.cadence = cadence
			this.calcPace()
			this.setDesc()
		}
        calcPace(){
			// min/km
			this.pace = this.duration / this.distance
			return this.pace
		}
	}

	class Cycling extends Workout{
		type = 'cycling'
		constructor(coords, distance, duration, elevationGain){
            super(coords, distance, duration)
			this.elevationGain = elevationGain
			this.calcSpeed() 
			this.setDesc()
		}
		calcSpeed(){ 
			// kn/hr
			this.speed = this.distance / (this.duration / 60)
		}
	}
	// const run1 = new Running([54, -14], 2.4, 30, 169)
	// const cycl = new Cycling([44, -18], 2.4, 25, 109)
	// console.log(run1)
	// console.log(cycl)





//////////////////////////////////////////////////////////////////
	//app Architecture
class App {
	#map;
	#mapZoomLevel;
	#mapEvent;
	#workouts = [];

	constructor() {

		//get user position
			this.getPosition()

			//get local storage
			this.getLocalSafe()

			//Attach handlers
form.addEventListener('submit', this.newWorkout.bind(this))
inputType.addEventListener('change', this.toggleElevationField)
containerWorkouts.addEventListener('click', this.moveToPopup.bind(this))
	}

	getPosition() {
		 
//Displaying location using Geolocation
if(navigator.geolocation){
	navigator.geolocation.getCurrentPosition(this.loadMap.bind(this),
	()=>{
		alert('Could not get your position')
	})
 }
	}

	loadMap(position) {
		const latitude = position.coords.latitude
		const longitude = position.coords.longitude
			
//Displaying a map using leaflet library
//npm install leaflet

const coords = [latitude, longitude]

this.#map = L.map('map').setView(coords, this)
// console.log(map)

L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
	attribution:
	'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(this.#map)

//Handling clicks on map
   this.#map.on('click', this.showForm.bind(this)
    //  const {lat, lng} = mapEvent.latlng
)

	}

	showForm(clickEvent) {
		this.#mapEvent = clickEvent
		form.classList.remove('hidden')
		inputDistance.focus()
	}
	hideForm(){  
    inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = ''
	form.classList.add('hidden')
	}

	toggleElevationField() {
		inputElevation.closest('.form__row').classList.toggle('form__row--hidden')
		inputCadence.closest('.form__row').classList.toggle('form__row--hidden')
	}

	newWorkout(e) {
		const validNumbers = (...inputs) => 
		inputs.every((inp) => Number.isFinite(inp))

		const PositiveNo = (...inputs) => inputs.every((inp)=> inp > 0)
		e.preventDefault()

		// Get data from form
		const type = inputType.value
		const distance = +inputDistance.value
		const duration = +inputDuration.value
		const {lat, lng} = this.#mapEvent.latlng
		let workout;

		// If workout =  running, create workout object
		if(type === 'running'){
			const cadence = +inputCadence.value
		
			// Check if data is valid
		if(!validNumbers(distance, duration, cadence) || !PositiveNo(distance, duration, cadence))
			return alert('Enter valid inputs: check for negative sign')

			workout = new Running([lat, lng], distance, duration, cadence)
		
	}

		// If workout cycling, create workout object
		if(type === 'cycling'){
			const elevation = +inputElevation.value
			if(!validNumbers(distance, duration, elevation) || !PositiveNo(distance, duration))
			return alert('Enter valid inputs: make sure you input a number in boxes provided')

			workout = new Cycling([lat, lng], distance, duration, elevation)
			
		}

		// Add new Object to workout array
        this.#workouts.push(workout)
        // Render workout on map as marker
		this.renderWorkoutMarker(workout)
		
		// Render workout on list
		this.newRenderWorkout(workout)
	// Hide form + clear input 
	   this.hideForm()
	
	   //set local storage to all workouts
	   this.setSafeLock()
	}
	
	renderWorkoutMarker(workout){
		L.marker(workout.coords)
		.addTo(this.#map)
		.bindPopup(L.popup({
		 maxWidth: 250,
		 minWidth:100,
		 autoClose: false,
		 closeOnClick: false, 
		 className: `${workout.type}-popup`,  
		}))
		.setPopupContent(`${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️' } ${workout.description}`)
		.openPopup()
		}

		newRenderWorkout(workout){
			let html =`
			<li class="workout workout--${workout.type}" data-id="${workout.id}">
          <h2 class="workout__title">${workout.description}</h2>
          <div class="workout__details">
            <span class="workout__icon">${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'}</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>
			`
			if(workout.type ==='running')
			html += `
			<div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>
			`
			if(workout.type === 'cycling')
			html +=`
			<div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevationGain}</span>
            <span class="workout__unit">m</span>
          </div>
        </li>
			`

	  form.insertAdjacentHTML('afterend', html)
}
  moveToPopup(e){
	  workoutEl = e.target.closest('workout')
	  if(!workoutEL) return;

	  const workout = this.#workouts.find(
		  work => work.id === workoutEL.dataset.id
	  )
	  this.#map.setView(workout.coords, this.#mapZoomLevel,{
		 animate:true,
		 pan:{
			 duration:1
		 } 
	  } )

	  // using the public interface
	  workout.clicks()
  }  

  setSafeLock(){
	  localStorage.setItem('workouts', JSON.stringify(this.#workouts))
  }

  getLocalSafe(){
	const data = JSON.parse(localStorage.getItem('workouts'))

	if(!data) return

	this.#workouts = data;

	this.#workouts.forEach(work => this.newRenderWorkout(work))
  }

  resetPage(){
	  localStorage.removeItem('workouts');
	  location.reload();
  }

} 
 
const app = new App()
// app.reset()



