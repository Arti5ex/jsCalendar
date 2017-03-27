"use strict";

(function () {

  class Calendar{    
    constructor(props){
      let self = this;
      let currentDateTimeForm = undefined;

      let formData = window.localStorage.getItem("form"); 
      
      let date = new Date();
      this.date = date;
      this.currentDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

      let dateStart = this.getDateStart(date);
      let dateEnd = this.getDateEnd(date);
      
      let calendarDays = this.calendarDays(dateStart, dateEnd);
      this.buildMonth(calendarDays);
      this.setMonthName(date);
      this.addEventsOnDays();
    }

    get self(){
      return this;
    }

    toMonthString(date) {
      let months = this.months;

      return months[date.getMonth()];
    }

    toMonthNumber(string) {
      let months = this.months;

      return months.indexOf(string);
    }

    formatMonthDay(number){ 
      return (number.length == 1 ? '0' + number : number);
    }

    get months(){
      return ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
    }

    toDayString(day) {
      let days = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"];

      return days[day];
    }

    buildMonth(calendarDays){
      let monthDOM = document.getElementById('month');

      const calendarMonthDOM = calendarDays.map((item, index) => {
        let date = new Date(item);
        let localItem = this.getEventLocal(date.getTime());
        
        let name = localItem ? localItem.event : '';
        let description = localItem ? localItem.description : '';

        let dayClass = localItem ? 'has-event' : '';
        dayClass = dayClass + (date.getTime() == this.currentDate.getTime() ? " current" : "");

        return '<div class="day ' + dayClass + '" name="day-' + item + '">' +
          '<div class="date">' + (index < 7 ? this.toDayString(index) + ', ' : "") + '' + date.getDate() + '</div>' +
          '<div class="day-event">' + name + '</div>' +
          '<div class="day-description">' + description + '</div></div>';
      }).reduce((sum, current) => {
        return sum + current;
      });
      
      monthDOM.innerHTML = calendarMonthDOM;
    }

    getDateStart(date){
      let dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      dateStart.setDate(1);
      dateStart.setDate(1 - dateStart.getDay());
      return dateStart;
    }

    getDateEnd(date){
      let dateEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      dateEnd.setDate(dateEnd.getDate() + 7 - dateEnd.getDay());
      return dateEnd;
    }

    changeMonth(date = new Date()){
      date.setMonth(date.getMonth() + 1);
      let dateStart = this.getDateStart(date);
      let dateEnd = this.getDateEnd(date);
      let calendarDays = this.calendarDays(dateStart, dateEnd);
      this.buildMonth(calendarDays);
      this.addEventsOnDays();
      return true;
    }

    addEventsOnDays(){
      let day = document.getElementsByClassName('day');
      let days = [].slice.call(day);

      days.map((item) => {
        item.addEventListener('click', () => {
          let dateTime = item.getAttribute("name").replace('day-', '');
          this.closeEventForm();
          this.closeConfigEventForm();
          this.disactiveDays();
          item.classList.toggle('active');
          this.currentDateTimeForm = dateTime;

          let localItem = this.getEventLocal(dateTime);

          if(localItem)
            this.openConfigEventForm(item, localItem);
          else
            this.openAddEventForm(item);
        });
      });

      return true;
    }

    openAddEventForm(item){
      let form = document.getElementById('addeventform');
      form.style.top = item.offsetTop - 8 + "px";  
      form.style.left = item.offsetLeft + 160 + "px";  
      form.classList.add('active');

      return true;
    }

    openConfigEventForm(item, event){
      let form = document.getElementById('config-event-form');
      form.style.top = item.offsetTop - 8 + "px";  
      form.style.left = item.offsetLeft + 160 + "px";  
      form.classList.add('active');
      
      let data = document.getElementById('config-data');
      let date = new Date(+event.dateTime);
      let dateString = date.getDate() + ' ' + this.toMonthString(date);
      data.innerHTML = "<h3>" + event.event + "</h3><div class='date'>" + dateString + "</div>" +
        "<div class='subtitle-bold'>Участники:</div><div>" + event.names + "</div>" ;

      return true;
    }

    monthListener(){
      let prev = document.getElementById('prev-month');
      let next = document.getElementById('next-month');
      let current = document.getElementById('current-button');
      let saveButton = document.getElementById('save');
      let saveShortButton = document.getElementById('save-short-event');
      let reloadButton = document.getElementById('page-reload');
      let openShortEventButton = document.getElementById('open-short-event-button');
      let closeEventButton = document.getElementById('close-event-form');
      let closeShortEventButton = document.getElementById('close-short-event-form');
      let closeConfigEventButton = document.getElementById('close-config-event-form');
      let deleteEventButton = document.getElementById('delete');
      let configSaveButton = document.getElementById('config-save');

      next.addEventListener("click", () => {
        this.date.setMonth(this.date.getMonth() + 1);
        this.nextMonth();
      });

      prev.addEventListener("click", () => {
        this.date.setMonth(this.date.getMonth() - 1);
        this.nextMonth();
      });

      current.addEventListener("click", () => {
        this.date = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), this.currentDate.getDate());
        this.nextMonth();
      });

      document.addEventListener("click", (e) => {
        this.hideOnDocumentClick(e);
      });

      saveButton.addEventListener("click", (e) => {
        this.saveEvent(e);
      });

      reloadButton.addEventListener("click", (e) => {
        this.reload(e);
      });

      openShortEventButton.addEventListener("click", (e) => {
        this.openAddShortEvent(e);
      });

      saveShortButton.addEventListener("click", (e) => {
        this.saveShortEvent(e);
      });

      closeEventButton.addEventListener("click", (e) => {
        this.closeEventForm(e);
      });

      closeShortEventButton.addEventListener("click", (e) => {
        this.hideShortEventForm(e);
      });

      closeConfigEventButton.addEventListener("click", (e) => {
        this.closeConfigEventForm(e);
      });

      deleteEventButton.addEventListener("click", (e) => {
        this.deleteEvent(e);
      });

      configSaveButton.addEventListener("click", (e) => {
        this.editEvent(e);
      });
    }

    saveEvent(e){
      e.preventDefault();
      let form = document.forms.addevent.elements;
      let formResult = {};

      for(let i = 0; i < 4; i++){
        formResult[form[i].name] = form[i].value;
      }

      formResult.dateTime = this.currentDateTimeForm;
      this.saveEventLocal(formResult);

      this.closeEventForm();
    }

    deleteEvent(e){
      e.preventDefault();

      if(this.getEventLocal(this.currentDateTimeForm)){
        this.deleteEventLocal();
      }

      this.closeConfigEventForm();

      return true;
    }

    editEvent(e){
      e.preventDefault();
      let description = document.forms.configevent.elements[0].value;
      let item = this.getEventLocal(this.currentDateTimeForm);

      if(item){
        item.description = description;
        this.editEventLocal(item);
      }

      return true;
    }

    saveShortEvent(e){
        e.preventDefault();
        let form = document.forms.addshortevent.elements[0].value;
        form = form.split(',');
        let event = form[2];
        let dateArray = form[0].split(' ');
        let monthNumber = this.toMonthNumber(dateArray[1]);
        let date = new Date(this.date.getFullYear(), monthNumber.toString(), this.formatMonthDay(dateArray[0]));
        let formResult = {};
      
      if(isNaN(date.getTime()) || !event){
        alert('Неправильно заполнены данные.');
        return false;
      }

      formResult.dateTime = date.getTime();
      formResult.event = form[2].toString();
      formResult.description = '';
      formResult.names = '';

      this.saveEventLocal(formResult);
      this.hideShortEventForm();
      
      return true;
    }

    saveEventLocal(event){
      let data = JSON.parse(window.localStorage.getItem("form"));
      let newItem = JSON.stringify(event);
      
      if(!data[event.dateTime])
        data[event.dateTime] = [newItem];
      else if(data[event.dateTime].length == 2)
        this.alertTooMuchEvent();
      else
        data[event.dateTime].push(newItem);
      
      window.localStorage.setItem("form", JSON.stringify(data));

      return true;
    }

    editEventLocal(event){
      let data = JSON.parse(window.localStorage.getItem("form"));

      data[event.dateTime].shift();
      data[event.dateTime][0] = JSON.stringify(event);

      window.localStorage.setItem("form", JSON.stringify(data));

      this.closeConfigEventForm();

      return true;
    }

    deleteEventLocal(){
      let form = JSON.parse(window.localStorage.getItem("form"));
      form[this.currentDateTimeForm].shift();
      window.localStorage.setItem("form", JSON.stringify(form));

      return true;
    }

    getEventLocal(dateTime){
      let data = JSON.parse(window.localStorage.getItem("form"));

      if(data[dateTime] !== undefined && data[dateTime].length > 0){
        return JSON.parse(data[dateTime][0]);
      }

      return false;
    }

    alertTooMuchEvent(){
      alert('Не может быть больше двух событий в день.');
    }

    nextMonth(){
      let date = this.date;
      let dateStart = this.getDateStart(date);
      let dateEnd = this.getDateEnd(date);
      
      let calendarDays = this.calendarDays(dateStart, dateEnd);

      this.setMonthName(date);
      this.buildMonth(calendarDays);
      this.addEventsOnDays();
    }

    setMonthName(date){
      let monthName = this.toMonthString(date);
      let monthNameDOM = document.getElementById('month-name');

      monthNameDOM.innerHTML = monthName + ' ' + date.getFullYear();
    }

    parentsHaveClassName(element, className) {
      var parent = element;
      while (parent) {
        if (parent.className && parent.className.indexOf(className) > -1)
          return true;

        parent = parent.parentNode;
      }
      return false;
    }

    disactiveDays(){
      let day = document.getElementsByClassName('day');
      let days = [].slice.call(day);

      days.map((item) => {
        item.classList.remove('active');
      })
    }

    calendarDays(dateStart, dateEnd){
      let calendarDays = [];

      while(dateStart.getTime() != dateEnd.getTime()){
        dateStart.setDate(dateStart.getDate() + 1);
        calendarDays.push(dateStart.getTime());
      }

      return calendarDays;
    }

    openAddShortEvent(){
      let addShortEventForm = document.getElementById('add-short-event-form');
      let openShortEventButton = document.getElementById('open-short-event-button');

      addShortEventForm.style.top = openShortEventButton.offsetTop + 28 + "px";  
      addShortEventForm.style.left = openShortEventButton.offsetLeft - 8 + "px";
      addShortEventForm.classList.add('active');

      return true;
    }

    closeAddShortEvent(){
      let addShortEventForm = document.getElementById('add-short-event-form');
      addShortEventForm.classList.remove('active');

      return true;
    }

    closeConfigEventForm(){
      let form = document.getElementById('config-event-form');
      form.classList.remove('active');

      return true;
    }
    
    hideOnDocumentClick(e) {
      if(!e.target.classList.contains('day') && !this.parentsHaveClassName(e.target, 'day') && !this.parentsHaveClassName(e.target, 'popup') ){
        this.closeEventForm();    
        this.closeConfigEventForm();    
      }

      if(!this.parentsHaveClassName(e.target, 'popup') && !e.target.classList.contains('button'))
        this.closeAddShortEvent();
    }

    closeEventForm() {
      let addeventdom = document.getElementById('addeventform');
      addeventdom.classList.remove('active');
      this.disactiveDays();

      return true;
    }

    hideShortEventForm(){
      let addeventdom = document.getElementById('add-short-event-form');
      addeventdom.classList.remove('active');

      return true;
    }

    reload(){
      window.location.reload();
    }

  }

  let calendar = new Calendar();
  calendar.monthListener();

  return Calendar;
    
})();
