function RandomHeader(props){
    const phrases = ["{} said:", "{} answered:", "{} thinks that:", "Here's {} answers:","Take a look at what {} wrote:", "Those are {} opinions:"];
    const res = phrases[Math.floor(Math.random() * phrases.length)].replace("{}", props.name);
    return <h3><i>{res}</i></h3>
}

export default RandomHeader