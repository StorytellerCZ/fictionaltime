/**
 * Fictional time library
 * This library works with provided fictional time and returns the fictional time
 * from provided milliseconds.
 * @author Jan Dvorak IV.
 * @copyright All rights reserved
 * @version 2.1
 * @since 2.0
 * @todo right now this class can only handle simetric times, will need to improve to handle more diverse times (test on Mayan calendar, then Augustine calendar - the main issue is the length of months)
 */

/**
 * The main object
 * @param {string} name Name of the time
 * @param {array} units Array of units lengths (int)
 * @param {array} unitsSpace how many spaces does the unit take (int)
 * @param {int} beginning The Earth Day the time beginnins in milliseconds - @todo make optional - ie. can be null
 * @param {array} separators Separations between the units
 * @param {string} declaration Where should be the time declaration displayed - before, after, both, false
 */
function fictionalTime(name, units, beginning, separators, declaration){
  //all inserted variables are public
  /** @todo revisit */
  this.name = name;
  this.units = units;
  this.beginning = beginning;
  this.separators = separators;
  this.declaration = declaration;

  //calculate unit spaces for adding appropriate number of zeroes
  var unitLength = [];
  for (var i = 0; i < units.length; i++) {
    if(i === 0)
    {
      unitLength[i] = 0;
    }
    else
    {
      var count = (units[i-1] / units[i]).toString();
      if(count[0] == 1)
      {
        //account for symetric times with  10, 100, etc.
        unitLength[i] = count.length - 1;
      }
      else
      {
        unitLength[i] = count.length;
      }
    }
  }

  /**
   * Calculates the time from milliseconds
   * @method toTime
   * @since 1.0
   * @param {int} milliseconds milliseconds that should be translated into the fictional time.
   * @return {string} Formated time display
   * @todo Add param to determine if to display declaration or not or only at one place (ie. before, after)
   */
  this.toTime = function(milliseconds)
  {
    var output = calculate(milliseconds, false);

    //return the string to display the time
    return format(output);
  }

  /**
   * Calculates the time from milliseconds and takes into account if the time
   * is before the beginning of the fictional time or not.
   * @method toDate
   * @since 2.0
   * @param {int} milliseconds milliseconds that should be translated into the fictional time.
   * @return {string} Formated time display
   * @todo Add param to determine if to display declaration or not or only at one place (ie. before, after)
   */
  this.toDate = function(milliseconds)
  {
    var output = calculate(milliseconds, true);

    //return the string to display the time
    return format(output);
  }

  /**
   * Current time
   * @method current
   * @since 2.0
   * @return {string} Formated current time in the fictional time
   */
  this.currentTime = function()
  {
    //first get current time in milliseconds
    var now = Date.now();
    //then get the offset
    var offset = new Date().getTimezoneOffset() * 60000;
    //calculate current time
    var output = calculate(new Date(now + offset), true);

    return format(output);
  }

  /**
   * Calculate specific unit from Earth Time to fictional time
   * @method toFictionalUnit
   * @since 2.0
   * @param {int} milliseconds
   * @param {int} toUnit To which unit should be the conversion done
   * @return {int} The calculated number
   */
 this.toFictionalUnit = function(milliseconds, toUnit)
 {
   return milliseconds / units[toUnit];
 }

 /**
  * Calculate specific unit from fictional time to milliseconds
  * @method unitToMilliseconds
  * @since 2.0
  * @param {int} count Number of units
  * @param {int} unit From what unit are we doing the conversion
  * @return {int} The calculated number in milliseconds
  */
  this.unitToMilliseconds = function(count, unit)
  {
    return count * units[unit];
  }

  /**
   * Calculates the fictional time
   * @method calculate
   * @since 2.0
   * @param {int} milliseconds The time to be calculated
   * @param {boolean} preTime Should the time be evaluated if it is before the establishment of the time?
   * @return {array} Array with the results to be used for the format function
   */
  function calculate(milliseconds, preTime)
  {
    var output = [];

    //evaluate preTime
    var beforeTime = false;

    //fix crazy values
    if(milliseconds < 0)
    {
      milliseconds = Math.abs(milliseconds);
    }

    //console.log("At start: " + milliseconds);
    if(preTime)
    {
      if(beginning > milliseconds)
      {
        beforeTime = true;
        //for time before establishment make it a countdown
        milliseconds = beginning - milliseconds;
      }
      else
      {
        //for a date after the establishment time remove the time to the establishment time for correct calculations
        milliseconds = milliseconds - beginning;
      }
    }

    for (var i = 0; i < units.length; i++)
    {
      //first calculate how many units are there
      var count = Math.floor( Math.abs( milliseconds / units[i]) );

      //calculate what is the maximum of the given unit
      var max = units[i-1] / units[i];

      /**
       * Assuming that the biggest unit is equivalent to years it should be counting down.
       * Other units should be going up as normal clocks.
       */
      if(i === 0 || !beforeTime)
      {
        //calculate how much of the given unit is there in the time
        output[i] = count;

        //account for getting the max unit
        if(count === max)
        {
          output[i] = 0;
          output[i-1] = parseInt(output[i-1]) + 1;
        }
      }
      else
      {
        //now get the correct number that is going to be increasing
        output[i] = max-count;
        //account for getting the max number displayed
        if(count === max)
        {
          output[i] = 0;
          output[i-1] = parseInt(output[i-1]) - 1;
        }
      }
      //reduce the time by the unit calculated
      milliseconds = milliseconds - (count * units[i]);
    }

    //have to have another loop due to lines 187 and 198
    for (var i = 0; i < units.length; i++)
    {
      //add the appropriate number of zeroes
      if(i === 0 && beforeTime)
      {
        output[i] = defaultZeros(output[i], unitLength[i], true);
      }
      else
      {
        output[i] = defaultZeros(output[i], unitLength[i], false);
      }
      //console.log("Unit " + i + " reminder after: " + milliseconds);
    }

    return output;
  }

  /**
   * Account for default zeros in the given fields
   * @method defaultZeros
   * @since 1.0
   * @param {int} number Number that should get the default zeroes before it in order to hold format
   * @param {int} unitLength How long is the given unit 1 through 3
   * @param {boolean} minus Boolean to determine if to add minus before the number or not
   * @return {string} the number with added default zeroes
   * @todo Improve that unitLength can handle more then size 3, use length of the current number to determine how many zeroes need to be added before
   */
  function defaultZeros(number, uLength, minus){

    number = number.toString();

    //first determine how many zeroes need to be added
    var add = uLength - number.length;

    //add the zeroes before the given number
    for (var i = 0; i < add; i++) {

      number = "0" + number;
    }
    //account for minus
    if(minus)
    {
      number = "-" + number;
    }

    return number;
  }

  /**
   * Function to return the time in the correct format
   * @method format
   * @since 1.1
   * @param {array} array with the values for each fields
   * @return {string}
   */
   function format(valuesArray)
   {
     //return the string to display the time
     var outputString;
     for (var i = 0; i < valuesArray.length; i++) {
       var k = i+1;

       //unit declaration before time
       if(i === 0)
       {
         if(declaration === "before" || declaration === "both")
         {
           outputString = separators[i];
         }
       }

       outputString += valuesArray[i] + separators[k];

       //unit declaration after time
       if(i === valuesArray.length)
       {
         if(declaration === "after" || declaration === "both")
         {
           outputString += separators[k+1];
         }
       }

     }
     return outputString;
   }

//end of the class
}
