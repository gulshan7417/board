import { BsPencil, BsCircle } from "react-icons/bs";
import { AiOutlineLine } from "react-icons/ai";
import { MdOutlineRectangle } from "react-icons/md";
import { BiEraser } from "react-icons/bi";
import { FaMousePointer } from "react-icons/fa";

export const tools = [
  {
    title: "Select",
    icon: <FaMousePointer />,
    value: "select",
  },
  {
    title: "Pencil",
    icon: <BsPencil />,
    value: "pencil",
  },
  {
    title: "Line",
    icon: <AiOutlineLine />,
    value: "line",
  },
  {
    title: "Rectangle",
    icon: <MdOutlineRectangle />,
    value: "rect",
  },
  {
    title: "Circle",
    icon: <BsCircle />,
    value: "circle",
  },
  {
    title: "Eraser",
    icon: <BiEraser />,
    value: "eraser",
  },
  {
    title: "Text",
    icon: <span className="text-4xl font-bold leading-none">T</span>,
    value: "text",
  },


  
];
