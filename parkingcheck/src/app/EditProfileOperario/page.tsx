import EditInfoOperario from "../components/EditInfoOperario";
import { NavbarOperario } from "../components/NavBarOperario";


export default function EditProfile() {
  return (
    <div>
      <NavbarOperario />
      <div className="Profile-box">
       <EditInfoOperario/>  
      </div>
    </div>
  );
};
