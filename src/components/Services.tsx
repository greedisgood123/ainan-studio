import { useState } from "react";
import { Button } from "./ui/button";


export default function Services() {

    const [count, setCount] = useState(1);
    return (
        <div>
            <Button onClick={() => setCount(count + 2)}>
                {count}
            </Button>
        </div>
    )
}