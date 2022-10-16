package server

import "strings"

type PassEntry struct {
	Name string
	Children []PassEntry
}

type User struct {
	// Display name of the user
  Name string
	// The IP addresses which this user can connect from
  Origins []string
}

//============================================================================//

// Recursively create a `PassEntry` for each name in the provided array
// with the first entry being the root parent, i.e.
//	/a/b/c --> [a,b,c]
//
// Example output:
//  {
//    "Name": "user",
//    "Children": [
//      {
//        "Name": "Service",
//        "Children": [
//          {
//            "Name": "acc1.gpg",
//            "Children": []
//          },
//          ...
//        ]
//      },
//		],
//   ...
//
func (d *PassEntry) AddChildren(names []string) {
		// Add a child with the current first node name if one does not exist
		var idx = d.HasChildWithName(names[0])
		if idx == -1 {
			d.Children = append(d.Children, PassEntry{ 
        Name: strings.TrimSuffix(names[0], ".gpg"), 
        Children: []PassEntry{},
      })
			idx = len(d.Children)-1
		}

		// Basecase
		if len(names)==1 {
				return
		}

		// Recursively add children for the remaining node names
		d.Children[idx].AddChildren(names[1:])
}

func (d *PassEntry) HasChildWithName(name string) int {
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

