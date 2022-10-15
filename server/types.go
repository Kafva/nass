package server

type JsonEntry struct {
	Name string
	Children []JsonEntry
}

type User struct {
	// Display name of the user
  Name string
	// The IP addresses which this user can connect from
  Origins []string
	// The name of the GPG key file to use for password operations
  KeyFile string
}

//============================================================================//

// Recursivly create a `JsonEntry` for each name in the provided array
// with the first entry being the root parent, i.e.
//	/a/b/c --> [a,b,c]
func (d *JsonEntry) AddChildren(names []string) {
		// Basecase
		if len(names)==0 {
				return
		}

		// Add a child with the current first node name if one does not exist
		var idx = d.HasChildWithName(names[0])
		if idx == -1 {
			d.Children = append(d.Children, JsonEntry{ Name: names[0], Children: []JsonEntry{} })
			idx = len(d.Children)-1
		}

		// Recursivly add children for the remaining node names
		d.Children[idx].AddChildren(names[1:])
}

func (d *JsonEntry) HasChildWithName(name string) int {
	for i,child := range d.Children {
		if child.Name == name {
			return i
		}
	}
	return -1
}

func (u *User) HasOrigin(origin string) bool {
	for _,o := range u.Origins {
		if o == origin {
			return true
		}
	}
	return false
}

